// src/app/core/store/reducers/cart.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as CartActions from '../actions/cart.actions';
import { initialState } from '../cart.state';

export const cartReducer = createReducer(
  initialState,
  on(CartActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    error: null
  })),
  on(CartActions.addTransaction, (state, { transaction }) => ({
    ...state,
    transactions: [...state.transactions, transaction],
    error: null
  })),
  on(CartActions.updateTransaction, (state, { id, updates }) => ({
    ...state,
    transactions: state.transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ),
    error: null
  })),
  on(CartActions.removeTransaction, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter(t => t.id !== id),
    error: null
  })),
  on(CartActions.clearCart, (state) => ({
    ...state,
    transactions: [],
    error: null
  })),
  on(CartActions.setError, (state, { error }) => ({
    ...state,
    error
  }))
);
