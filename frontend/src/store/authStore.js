import { create } from "zustand";

import { apiClient } from "../api/client.js";

export const useAuthStore = create((set, get) => ({
  token: null,
  customer: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      set({
        token: data.access_token,
        customer: data.customer,
        loading: false,
        error: null,
      });
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Login failed. Please try again.";
      set({ loading: false, error: msg });
      return false;
    }
  },

  logout: () => {
    set({ token: null, customer: null, error: null });
  },

  getToken: () => get().token,
}));
