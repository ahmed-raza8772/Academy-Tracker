class AuthService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async login(email, password) {
    try {
      const url = `${this.baseURL}/api/v1/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (err) {
      console.error("AuthService login error:", err);
      throw err;
    }
  }

  // Later you can add more APIs like:
  // async register(userData) { ... }
  // async refreshToken(token) { ... }
}

const API_URL = import.meta.env.VITE_API_URL;
export const authService = new AuthService(API_URL);
