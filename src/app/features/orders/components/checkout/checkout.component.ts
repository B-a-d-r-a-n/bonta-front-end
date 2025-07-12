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
} from '@core/models';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

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

  // --- Queries & Mutations ---
  private orderQueries = inject(OrderQueries);
  private cartQueries = inject(CartQueries);
  private userQueries = inject(UserQueries);

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

  // --- UI State ---
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

  // --- Computed Signals ---
  basketData = computed(() => this.basketQuery.data());
  deliveryMethodsData = computed(() => this.deliveryMethodsQuery.data());
  isAddressLoading = computed(() => this.addressQuery.isLoading);
  isDeliveryMethodsLoading = computed(
    () => this.deliveryMethodsQuery.isLoading
  );
  isCreateOrderPending = computed(() => this.createOrderMutation.isPending());

  canProceed = computed(() => {
    switch (this.checkoutStore.currentStep()) {
      case 'address':
        return this.addressForm.valid;
      case 'delivery':
        return !!this.checkoutStore.deliveryMethod();
      case 'review':
        return true;
      case 'payment':
        return false; // Enable when payment is ready
      default:
        return false;
    }
  });

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

  constructor() {
    // Effect to pre-fill the form when the user's saved address loads
    effect(
      () => {
        const savedAddress = this.addressQuery.data();
        if (savedAddress && !this.addressForm.dirty) {
          // Use a DTO that matches the form structure (without saveAddress)
          const addressToPatch: Omit<
            AddressDTO,
            'zipCode' | 'address1' | 'address2' | 'fullName' | 'state'
          > = {
            firstName: savedAddress.firstName,
            lastName: savedAddress.lastName,
            street: savedAddress.street,
            city: savedAddress.city,
            country: savedAddress.country,
          };
          this.addressForm.patchValue(addressToPatch);
        }
      },
      { allowSignalWrites: true }
    );
  }

  // --- Event Handlers ---
  nextStep(): void {
    if (!this.canProceed()) return;
    if (this.checkoutStore.currentStep() === 'address') {
      this.checkoutStore.setAddress(this.addressForm.value);
    }
    this.checkoutStore.nextStep();
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

    const placeOrder = () => {
      const orderRequest: OrderRequest = {
        basketId: basket.id,
        deliveryMethodId: deliveryMethod.id,
        shipToAddress: address,
      };
      this.createOrderMutation.mutate(orderRequest, {
        onSuccess: (order: OrderResponse) => {
          this.checkoutStore.resetCheckout();
          StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
          this.router.navigate(['/orders', 'success', order.id]);
        },
      });
    };

    if (shouldSaveAddress) {
      this.updateAddressMutation.mutate(address, { onSuccess: placeOrder });
    } else {
      placeOrder();
    }
  }

  // --- Template Helpers ---
  isInvalid(controlName: string): boolean {
    const control = this.addressForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
