import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { AddressDTO } from '../../../core/models/address.model';
import { DeliveryMethodResponse } from '../../../core/models/order.model';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { StorageUtils } from '../../../shared/utils/storage.utils';
import { isPlatformBrowser } from '@angular/common';

export enum CheckoutStep {
  ADDRESS = 'address',
  DELIVERY = 'delivery',
  PAYMENT = 'payment',
  REVIEW = 'review',
}

const STEPS_ORDER = [
  CheckoutStep.ADDRESS,
  CheckoutStep.DELIVERY,
  CheckoutStep.PAYMENT,
  CheckoutStep.REVIEW,
];

export interface CheckoutState {
  currentStep: CheckoutStep;
  address: AddressDTO | null;
  deliveryMethod: DeliveryMethodResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  currentStep: CheckoutStep.ADDRESS,
  address: null,
  deliveryMethod: null,
  isLoading: false,
  error: null,
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState<CheckoutState>(initialState),
  withComputed(({ currentStep }) => ({
    currentStepIndex: computed(() => STEPS_ORDER.indexOf(currentStep())),
  })),
  withMethods((store) => ({
    setStep(step: CheckoutStep) {
      patchState(store, { currentStep: step });
    },
    nextStep() {
      const currentIndex = STEPS_ORDER.indexOf(store.currentStep());
      if (currentIndex < STEPS_ORDER.length - 1) {
        patchState(store, { currentStep: STEPS_ORDER[currentIndex + 1] });
      }
    },
    previousStep() {
      const currentIndex = STEPS_ORDER.indexOf(store.currentStep());
      if (currentIndex > 0) {
        patchState(store, { currentStep: STEPS_ORDER[currentIndex - 1] });
      }
    },
    setAddress(address: AddressDTO) {
      patchState(store, { address, error: null });
    },
    setDeliveryMethod(deliveryMethod: DeliveryMethodResponse | null) {
      patchState(store, { deliveryMethod, error: null });
    },
    setLoading(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
    resetCheckout() {
      patchState(store, initialState);
      StorageUtils.removeLocalItem(STORAGE_KEYS.CHECKOUT_ADDRESS);
      StorageUtils.removeLocalItem(STORAGE_KEYS.SELECTED_DELIVERY_METHOD);
    },
  })),
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        const savedAddress = StorageUtils.getLocalItem<AddressDTO>(
          STORAGE_KEYS.CHECKOUT_ADDRESS
        );
        const savedDeliveryMethod =
          StorageUtils.getLocalItem<DeliveryMethodResponse>(
            STORAGE_KEYS.SELECTED_DELIVERY_METHOD
          );

        patchState(store, {
          address: savedAddress,
          deliveryMethod: savedDeliveryMethod,
        });

        // Auto-save to localStorage
        effect(() => {
          const address = store.address();
          if (address) {
            StorageUtils.setLocalItem(STORAGE_KEYS.CHECKOUT_ADDRESS, address);
          }
        });
        effect(() => {
          const deliveryMethod = store.deliveryMethod();
          if (deliveryMethod) {
            StorageUtils.setLocalItem(
              STORAGE_KEYS.SELECTED_DELIVERY_METHOD,
              deliveryMethod
            );
          }
        });
      }
    },
  })
);
