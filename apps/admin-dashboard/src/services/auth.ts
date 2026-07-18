import { fetchApi } from "./apiClient";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    return fetchApi("/auth/logout", {
      method: "POST",
    });
  },

  getUser: () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodedPayload);
    } catch (e) {
      return null;
    }
  },
};
