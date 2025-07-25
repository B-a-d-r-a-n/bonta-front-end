import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BasketDTO, ErrorDetails } from '@core/models';
import { API_URL } from 'app/app.config';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CartQueries {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private apiUrl = inject(API_URL);

  private static readonly BASKET_KEY = ['basket'];

  getBasketById(id: string | null) {
    return {
      queryKey: ['basket', id],
      queryFn: () => this.fetchBasket(id!),
    };
  }

  updateBasket() {
    return {
      mutationFn: (basket: BasketDTO) => this.updateBasketApi(basket),
      onSuccess: (updatedBasket: BasketDTO) => {
        this.queryClient.setQueryData(
          ['basket', updatedBasket.id],
          updatedBasket
        );
      },
      onError: (error: ErrorDetails) => {
        console.error('Failed to update basket:', error?.errorMessage || error);
      },
    };
  }

  deleteBasket() {
    return {
      mutationFn: (id: string) => this.deleteBasketApi(id),
      onSuccess: (id: string) => {
        this.queryClient.setQueryData(['basket', id], null);
      },
    };
  }

  public fetchBasket(id: string): Promise<BasketDTO | null> {
    if (!id) {
      return Promise.resolve(null);
    }
    return lastValueFrom(
      this.http.get<BasketDTO>(`${this.apiUrl}${API_ENDPOINTS.BASKETS.GET}`, {
        params: { id },
      })
    );
  }

  public updateBasketApi(basket: BasketDTO): Promise<BasketDTO> {
    return lastValueFrom(
      this.http.post<BasketDTO>(
        `${this.apiUrl}${API_ENDPOINTS.BASKETS.ADD_ITEM}`,
        basket
      )
    );
  }

  public deleteBasketApi(id: string): Promise<string> {
    return lastValueFrom(
      this.http
        .delete<void>(`${this.apiUrl}${API_ENDPOINTS.BASKETS.GET}`, {
          params: { id },
        })
        .pipe(map(() => id))
    );
  }
}
