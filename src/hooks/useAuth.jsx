// context/UseAuth.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  userRole: localStorage.getItem("userRole") || null,
  username: localStorage.getItem("username") || null,

  login: (token, role, username, remember) => {
    // ✅ Update Zustand state
    set({ token, userRole: role, username });

    if (remember) localStorage.setItem("token", token);
    // ✅ Persist to localStorage

    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);
  },

  logout: () => {
    // ✅ Clear Zustand state
    set({ token: null, userRole: null, username: null });

    // ✅ Remove from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
  },
}));
