// src/app/core/store/actions/cart.actions.ts
import { createAction, props } from '@ngrx/store';
import { CartTransaction } from '../../models/cart-transaction.model';

export const addTransaction = createAction(
  '[Cart] Add Transaction',
  props<{ transaction: CartTransaction }>()
);

export const updateTransaction = createAction(
  '[Cart] Update Transaction',
  props<{ id: string; updates: Partial<CartTransaction> }>()
);

export const removeTransaction = createAction(
  '[Cart] Remove Transaction',
  props<{ id: string }>()
);

export const clearCart = createAction('[Cart] Clear');

export const validateCart = createAction('[Cart] Validate');

export const setError = createAction(
  '[Cart] Set Error',
  props<{ error: string }>()
);

export const loadTransactionsSuccess = createAction(
  '[Cart] Load Transactions Success',
  props<{ transactions: CartTransaction[] }>()
);


