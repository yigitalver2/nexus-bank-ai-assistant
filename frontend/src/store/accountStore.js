import { create } from "zustand";

import { apiClient } from "../api/client.js";

export const useAccountStore = create((set) => ({
  accounts: [],
  transactions: [],
  tickets: [],
  loading: false,
  error: null,

  fetchAll: async (customerId) => {
    if (!customerId) return;
    set({ loading: true, error: null });
    try {
      const [accountsRes, transactionsRes, ticketsRes] = await Promise.all([
        apiClient.get(`/api/account/${customerId}`),
        apiClient.get(`/api/transactions/${customerId}`),
        apiClient.get(`/api/tickets/${customerId}`),
      ]);
      set({
        accounts: accountsRes.data,
        transactions: transactionsRes.data,
        tickets: ticketsRes.data,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.detail || "Failed to load account data.",
      });
    }
  },

  reset: () =>
    set({
      accounts: [],
      transactions: [],
      tickets: [],
      loading: false,
      error: null,
    }),
}));
