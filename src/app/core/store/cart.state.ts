// src/app/core/store/cart.state.ts
import { CartTransaction } from '../models/cart-transaction.model';

export interface CartState {
  transactions: CartTransaction[];
  error: string | null;
  loading: boolean;
}

export const initialState: CartState = {
  transactions: [],
  error: null,
  loading: false
};
