// src/app/core/store/effects/cart.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, withLatestFrom } from 'rxjs/operators';
import * as CartActions from '../actions/cart.actions';
import { selectCartState } from '../selectors/cart.selectors';

@Injectable()
export class CartEffects {
  validateCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.validateCart),
      withLatestFrom(this.store.select(selectCartState)),
      map(([_, state]) => {
        const hasInvalidTransactions = state.transactions.some(
          t => t.amount <= 0
        );

        if (hasInvalidTransactions) {
          return CartActions.setError({
            error: 'Some transactions have invalid amounts'
          });
        }

        return CartActions.clearCart();
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store
  ) {}
}
