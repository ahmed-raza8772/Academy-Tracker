import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import logo from "../../assets/images/logo/logo.svg";
import logodark from "../../assets/images/logo/logo-dark.svg";
import Alert from "../ui/alert/Alert";

export default function SignInForm({ onSubmit, errorMessage }) {
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(false);

  const [passEmpty, setPassEmpty] = useState(false);
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset previous single-field errors
    setEmailEmpty(false);
    setPassEmpty(false);

    // Clear the full-form client-side alert on new attempt
    setAlert(null);

    if (onSubmit) {
      if (!email.trim() && !password.trim()) {
        // Both fields empty - show the full alert
        setAlert({
          variant: "error",
          title: "Oops!",
          message: "Email and Password are required!",
        });

        setTimeout(() => setAlert(null), 3000);
      } else if (!email.trim()) {
        setEmailEmpty(true);
        setTimeout(() => setEmailEmpty(false), 3000);
      } else if (!password.trim()) {
        setPassEmpty(true);
        setTimeout(() => setPassEmpty(false), 3000);
      } else {
        // 🔥 MODIFICATION: Always send remember: true
        onSubmit({ email, password, remember: true });
      }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link to="/Account/login" className="lg:hidden">
          <img className="dark:hidden" src={logo} alt="Logo" />
          <img className="hidden dark:block" src={logodark} alt="Logo" />
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          {/* Server-side error message */}
          {errorMessage && (
            <div className="mb-4">
              <Alert
                variant="error"
                title="Login Failed!"
                message={errorMessage}
                showLink={false}
              />
            </div>
          )}

          {/* Existing client-side validation error display */}
          {alert && (
            <div className="mb-4">
              <Alert
                variant={alert.variant}
                title={alert.title}
                message={alert.message}
                showLink={false}
              />
            </div>
          )}

          {/* Divider */}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@gmail.com"
                  error={emailEmpty}
                  hint={emailEmpty ? "Email is Required!" : ""}
                  required
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    error={passEmpty}
                    hint={passEmpty ? "Password is Required!" : ""}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* 🔥 MODIFICATION: Removed checkbox and "Keep me logged in" text */}
                <div></div>
                <Link
                  to="/Account/forgot"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <div>
                <Button className="w-full" size="sm" type="submit">
                  Sign in
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/Account/register"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
