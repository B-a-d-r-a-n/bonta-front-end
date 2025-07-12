import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { StorageUtils } from '@shared/utils/storage.utils';

// The only state we need is the ID.
type CartState = {
  basketId: string | null;
};

const initialState: CartState = {
  basketId: null,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    // Method to load the ID from storage at startup.
    loadId() {
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        patchState(store, {
          basketId: StorageUtils.getLocalItem<string>(STORAGE_KEYS.BASKET_ID),
        });
      }
    },
    // Method to update the ID when a new cart is created or cleared.
    setId(id: string | null) {
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        if (id) {
          StorageUtils.setLocalItem(STORAGE_KEYS.BASKET_ID, id);
        } else {
          StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
        }
      }
      patchState(store, { basketId: id });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadId();
    },
  })
);
