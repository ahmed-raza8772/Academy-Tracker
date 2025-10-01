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
        // 🔥 ENHANCEMENT: Check for specific unauthorized status (401)
        if (res.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        }

        // Fallback to the server's error message (e.g., from a 400 Bad Request)
        throw new Error(
          data.message || "Login failed. Please check your network connection."
        );
      }
      console.log(data.message);
      return data;
    } catch (err) {
      console.error("AuthService login error:", err);
      // Re-throw the error so the calling function can catch it and display it to the user
      throw err;
    }
  }

  // Later you can add more APIs like:
  // async register(userData) { ... }
  // async refreshToken(token) { ... }
}

const API_URL = import.meta.env.VITE_API_URL;
export const authService = new AuthService(API_URL);
