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
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const role = "Admin";
  const handleSignIn = async ({ email, password, remember }) => {
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      const { token } = data;
      console.log({ token });
      login(token, role, "admin", remember);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (Loading) return <Loader />;
  return (
    <>
      <PageMeta title="Academy Tracker" />
      <AuthLayout>
        <SignInForm onSubmit={handleSignIn} />
      </AuthLayout>
    </>
  );
}
