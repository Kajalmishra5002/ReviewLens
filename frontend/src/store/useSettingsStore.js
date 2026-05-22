import { create } from "zustand";

const useSettingsStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",
  language: localStorage.getItem("language") || "en",
  currency: localStorage.getItem("currency") || "INR",
  dateFormat: localStorage.getItem("dateFormat") || "DD/MM/YYYY",
  accentColor: localStorage.getItem("accentColor") || "purple",
  notifications: (() => {
    try {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : {
        email: true,
        order: true,
        marketing: false,
        security: true,
        push: false
      };
    } catch (e) {
      return {
        email: true,
        order: true,
        marketing: false,
        security: true,
        push: false
      };
    }
  })(),

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem("language", language);
    set({ language });
  },

  setCurrency: (currency) => {
    localStorage.setItem("currency", currency);
    set({ currency });
  },

  setDateFormat: (dateFormat) => {
    localStorage.setItem("dateFormat", dateFormat);
    set({ dateFormat });
  },

  setAccentColor: (accentColor) => {
    localStorage.setItem("accentColor", accentColor);
    set({ accentColor });
  },

  toggleNotification: (key) =>
    set((state) => {
      const newNotifs = {
        ...state.notifications,
        [key]: !state.notifications[key],
      };
      localStorage.setItem("notifications", JSON.stringify(newNotifs));
      return { notifications: newNotifs };
    }),
}));

export default useSettingsStore;
