import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useNavigate } from "react-router";
import Loader from "../../components/common/Loader.jsx";
import { useState } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import { authService } from "../../services/auth/authServices.js";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSignIn = async ({ email, password, remember }) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      console.log("Starting login process with email:", email);

      const data = await authService.login(email, password);
      console.log("AuthService response:", data);

      const { token, role } = data;

      if (!token) {
        throw new Error("No token received from server");
      }

      const username = email.split("@")[0]; // Extract username from email

      console.log("Assigned role:", role);
      console.log("Username:", username);

      // Store token, role, and username in Zustand and localStorage
      login(token, role, username, remember);

      // Navigate based on assigned role
      const redirectPath = getDashboardPath(role);
      console.log("Navigating to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get dashboard path
  const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/Admin/Dashboard";
      case "teacher":
        return "/Teacher/Dashboard";
      case "student":
        return "/Student/Dashboard";
      case "parent":
        return "/Parents/Dashboard";
      default:
        return "/Admin/Dashboard"; // Default to admin dashboard
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageMeta title="AE EduTrack | Sign In" />
      <AuthLayout>
        <SignInForm onSubmit={handleSignIn} errorMessage={errorMessage} />
      </AuthLayout>
    </>
  );
}
