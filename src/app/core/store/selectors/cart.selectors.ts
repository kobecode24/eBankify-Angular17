// src/app/core/store/selectors/cart.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from '../cart.state';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectAllTransactions = createSelector(
  selectCartState,
  (state) => state.transactions
);

export const selectCartTotal = createSelector(
  selectAllTransactions,
  (transactions) => transactions.reduce((total, t) => total + t.amount, 0)
);

export const selectTransactionCount = createSelector(
  selectAllTransactions,
  (transactions) => transactions.length
);

export const selectIsCartFull = createSelector(
  selectTransactionCount,
  (count) => count >= 10
);

export const selectCartError = createSelector(
  selectCartState,
  (state) => state.error
);
