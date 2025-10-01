import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useNavigate } from "react-router";
import Loader from "../../components/common/Loader.jsx";
import { useState } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import { authService } from "../../services/auth/authServices.js";

export default function SignIn() {
  const [Loading, setLoading] = useState(false);
  // 🔥 1. State to hold and display error messages
  const [errorMessage, setErrorMessage] = useState(null);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const role = "Admin";

  const handleSignIn = async ({ email, password, remember }) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      console.log("1. Starting login process with email:", email);

      const data = await authService.login(email, password);
      console.log("2. AuthService response:", data);

      const { token } = data;
      console.log("3. Token received:", token);

      // Check if login function exists and call it
      console.log("4. Calling login function...");
      login(token, role, "admin123", remember);
      console.log("5. Login function completed");

      // Successful login navigation
      console.log("6. Navigating based on role:", role);
      if (role === "Admin") {
        navigate("/Admin/Dashboard");
      } else if (role === "Student") {
        navigate("/Student/Dashboard");
      } else if (role === "Teacher") {
        navigate("/Teacher/Dashboard");
      } else if (role === "Parent") {
        navigate("/Parents/Dashboard");
      } else {
        navigate("/");
      }
      console.log("7. Navigation triggered");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };
  if (Loading) return <Loader />;

  return (
    <>
      <PageMeta title="AE EduTrack | Sign In" />
      <AuthLayout>
        <SignInForm onSubmit={handleSignIn} errorMessage={errorMessage} />
      </AuthLayout>
    </>
  );
}
