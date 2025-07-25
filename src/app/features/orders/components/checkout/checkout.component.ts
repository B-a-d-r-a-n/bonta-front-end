import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';

// Core & Shared Imports
import {
  injectQuery,
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { OrderQueries } from '../../queries/order.queries';
import { CartQueries } from '@features/cart/queries/cart.queries';
import { UserQueries } from '@features/user/queries/user.queries';
import { CheckoutStore } from '../../store/checkout.store';
import {
  OrderRequest,
  DeliveryMethodResponse,
  BasketItemDTO,
  OrderResponse,
  AddressDTO,
  BasketDTO,
} from '@core/models';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentQueries } from '@features/payments/queries/payment.queries';
import { CartDataService } from '@features/cart/services/cart-data.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ButtonModule,
    CardModule,
    InputTextModule,
    ProgressSpinnerModule,
    StepsModule,
    RadioButtonModule,
    CheckboxModule,
    DividerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly checkoutStore = inject(CheckoutStore);
  private cartDataService = inject(CartDataService); // Inject CartDataService

  // --- Queries & Mutations --
  private paymentQueries = inject(PaymentQueries); // Inject PaymentQueries-
  private orderQueries = inject(OrderQueries);
  private cartQueries = inject(CartQueries);
  private userQueries = inject(UserQueries);
  private queryClient = inject(QueryClient); // Inject QueryClient

  private basketId =
    StorageUtils.getLocalItem<string>(STORAGE_KEYS.BASKET_ID) || 'default';

  basketQuery = injectQuery(() =>
    this.cartQueries.getBasketById(this.basketId)
  );
  deliveryMethodsQuery = injectQuery(() =>
    this.orderQueries.getDeliveryMethods()
  );
  addressQuery = injectQuery(() => this.userQueries.getAddress());
  createOrderMutation = injectMutation(() => this.orderQueries.createOrder());
  updateAddressMutation = injectMutation(() =>
    this.userQueries.updateAddress()
  );
  createPaymentIntentMutation = injectMutation(() =>
    this.paymentQueries.createPaymentIntent()
  );
  isUpdatingBasket = computed(() =>
    this.cartDataService.updateBasketMutation.isPending()
  );

  isCreateOrderPending = computed(
    () =>
      this.createOrderMutation.isPending() ||
      this.createPaymentIntentMutation.isPending()
  ); // --- UI State ---
  steps = [
    { label: 'Address' },
    { label: 'Delivery' },
    { label: 'Review' },
    { label: 'Payment' },
  ];
  activeStepIndex = this.checkoutStore.currentStepIndex;
  addressForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    saveAddress: [false],
  });

  // Create a signal from the form's statusChanges observable.
  // It will automatically update whenever the form's validity changes.
  private addressFormStatus = toSignal(this.addressForm.statusChanges, {
    initialValue: this.addressForm.status,
  });

  // --- Computed Signals ---
  basketData = computed(() => this.basketQuery.data());

  deliveryMethodsData = computed(() => this.deliveryMethodsQuery.data());

  isAddressLoading = computed(() => this.addressQuery.isPending());

  isDeliveryMethodsLoading = computed(() =>
    this.deliveryMethodsQuery.isPending()
  );

  canProceed = computed(() => {
    if (this.isUpdatingBasket() || this.isCreateOrderPending()) {
      return false;
    }
    switch (this.checkoutStore.currentStep()) {
      case 'address':
        if (this.isAddressLoading()) {
          return false;
        }
        // Depend on our new reactive signal!
        return this.addressFormStatus() === 'VALID';
      case 'delivery':
        if (this.isDeliveryMethodsLoading()) {
          return false;
        }
        return !!this.checkoutStore.deliveryMethod();
      case 'review':
        return !this.isCreateOrderPending();
      case 'payment':
        return false;
      default:
        return false;
    }
  });

  constructor() {
    effect(() => {
      const savedAddress = this.addressQuery.data();
      if (savedAddress && !this.addressForm.dirty) {
        const addressToPatch: AddressDTO = {
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName,
          street: savedAddress.street,
          city: savedAddress.city,
          country: savedAddress.country,
        };
        this.addressForm.patchValue(addressToPatch);
      }
    });
  }

  getSubtotal = computed(
    () =>
      this.basketData()?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) || 0
  );
  getTotalPrice = computed(
    () => this.getSubtotal() + (this.checkoutStore.deliveryMethod()?.price || 0)
  );

  // --- Event Handlers ---
  nextStep(): void {
    if (!this.canProceed()) return;

    const currentStep = this.checkoutStore.currentStep();

    if (currentStep === 'address') {
      this.checkoutStore.setAddress(this.addressForm.value);
      this.checkoutStore.nextStep();
    } else if (currentStep === 'delivery') {
      const basket = this.basketQuery.data();
      const deliveryMethod = this.checkoutStore.deliveryMethod();

      if (basket && deliveryMethod) {
        const updatedBasket: BasketDTO = {
          ...basket,
          deliveryMethodId: deliveryMethod.id,
          shippingPrice: deliveryMethod.price,
        };

        // Call the mutation to save the basket to the server
        this.cartDataService.updateBasketMutation.mutate(updatedBasket, {
          onSuccess: () => {
            // Only proceed after the update is successful
            this.checkoutStore.nextStep();
          },
          onError: (err) => {
            console.error('Failed to update basket with delivery method.', err);
            // Optionally show a toast message to the user here
          },
        });
      }
    } else {
      this.checkoutStore.nextStep();
    }
  }

  prevStep(): void {
    this.checkoutStore.previousStep();
  }

  onDeliveryMethodChange(method: DeliveryMethodResponse): void {
    this.checkoutStore.setDeliveryMethod(method);
  }

  onSubmit(): void {
    const address = this.checkoutStore.address();
    const deliveryMethod = this.checkoutStore.deliveryMethod();
    const basket = this.basketData();
    const shouldSaveAddress = this.addressForm.get('saveAddress')?.value;

    if (!address || !deliveryMethod || !basket) return;

    // This is the single function that will be called after prerequisites are met.
    const proceedToPayment = () => {
      // Step 1: Create the Payment Intent
      this.createPaymentIntentMutation.mutate(basket.id, {
        onSuccess: (updatedBasketWithIntent: BasketDTO) => {
          // Step 2: Construct the order request object that will be used on the payment page
          const orderRequest: OrderRequest = {
            basketId: updatedBasketWithIntent.id,
            deliveryMethodId: deliveryMethod.id,
            shipToAddress: address,
          };

          // Step 3: Navigate to the payment page, passing all necessary data.
          this.router.navigate(['/payments'], {
            state: {
              orderRequest: orderRequest,
              clientSecret: updatedBasketWithIntent.clientSecret,
              total: this.getTotalPrice(), // Pass the calculated total
            },
          });
        },
        onError: (err) => {
          console.error('Failed to create payment intent', err);
          // Optionally show a toast message to the user here.
        },
      });
    };

    // If the user wants to save their address, do that first, then proceed to payment.
    if (shouldSaveAddress) {
      this.updateAddressMutation.mutate(address, {
        onSuccess: proceedToPayment,
      });
    } else {
      // Otherwise, just proceed directly to payment.
      proceedToPayment();
    }
  }
  // --- Template Helpers ---
  isInvalid(controlName: string): boolean {
    const control = this.addressForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
