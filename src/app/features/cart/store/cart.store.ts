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

// 1. Define the state shape
type CartState = {
  basketId: string | null;
};

const initialState: CartState = {
  basketId: null,
};

// 2. Create the store using the signalStore function
export const CartStore = signalStore(
  // Provide the store at the root level, making it a singleton
  { providedIn: 'root' },

  // Add the state slice to the store
  withState(initialState),

  // Add methods to interact with the store
  withMethods((store, platformId = inject(PLATFORM_ID)) => ({
    loadIdFromStorage() {
      if (isPlatformBrowser(platformId)) {
        const id = StorageUtils.getLocalItem<string>(STORAGE_KEYS.BASKET_ID);
        patchState(store, { basketId: id });
      }
    },
    setId(id: string | null) {
      if (isPlatformBrowser(platformId)) {
        if (id) {
          StorageUtils.setLocalItem(STORAGE_KEYS.BASKET_ID, id);
        } else {
          StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
        }
      }
      patchState(store, { basketId: id });
    },
  })),

  // Add lifecycle hooks
  withHooks({
    onInit(store) {
      store.loadIdFromStorage();
    },
  })
);
