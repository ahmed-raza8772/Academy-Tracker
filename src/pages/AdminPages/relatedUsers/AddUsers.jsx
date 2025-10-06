import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import SuccessMessage from "../../../components/ui/success/SuccessMessage";

export default function AddUsers() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [, setIsPrefilled] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "student", label: "Student" },
    { value: "parent", label: "Parent" },
    { value: "teacher", label: "Teacher" },
  ];

  // Pre-fill form from URL parameters when component mounts
  useEffect(() => {
    const email = searchParams.get("email");
    const username = searchParams.get("username");
    const role = searchParams.get("role");

    if (email) {
      setFormData((prev) => ({
        ...prev,
        email: email,
        username: username || email,
        role: role || "student",
      }));
      setIsPrefilled(true);
    }
  }, [searchParams]);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case "fullname":
        if (!value.trim()) {
          errors.fullname = "Full name is required";
        } else {
          delete errors.fullname;
        }
        break;
      case "email":
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email address";
        } else {
          delete errors.email;
        }
        break;
      case "username":
        if (!value.trim()) {
          errors.username = "Username is required";
        } else {
          delete errors.username;
        }
        break;
      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }
        break;
      case "role":
        if (!value) {
          errors.role = "Role is required";
        } else {
          delete errors.role;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]: value,
      };

      // Automatically set username to match email when email changes
      if (name === "email") {
        updatedFormData.username = value;
      }

      return updatedFormData;
    });

    // Validate field on change
    validateField(name, value);

    // Clear general error when user starts typing
    if (error) setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullname.trim()) errors.fullname = "Full name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) errors.role = "Role is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API - include username
      const userData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(), // Send username to backend
        password: formData.password,
        role: formData.role,
      };

      console.log("Sending user data:", userData);

      const response = await fetch(`${API_URL}/api/v1/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setShowSuccess(true);
      // Reset form
      setFormData({
        fullname: "",
        email: "",
        username: "",
        password: "",
        role: "",
      });
      setFieldErrors({});
      setIsPrefilled(false);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasError = Object.keys(fieldErrors).length > 0;

  return (
    <div>
      <PageMeta
        title="Add Users | Admin Dashboard"
        description="Add new users to the system"
      />
      <PageBreadcrumb pageTitle="Add Users" />

      {/* Success Message */}
      <SuccessMessage
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="User Created Successfully!"
        message="The new user has been added to the system."
        autoClose={true}
        duration={6000}
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px]">
          <div className="text-center mb-8">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Add New User
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              Create a new user account by filling out the form below
            </p>
          </div>

          {/* General Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Full Name *
              </label>
              <Input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="Enter full name"
                value={formData.fullname}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.fullname}
                success={formData.fullname && !fieldErrors.fullname}
                disabled={loading}
              />
              {fieldErrors.fullname && (
                <p className="mt-1.5 text-xs text-error-500">
                  {fieldErrors.fullname}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address *
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.email}
                success={formData.email && !fieldErrors.email}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-error-500">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Username - Auto-filled from email */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username *
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="Username will auto-fill from email"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.username}
                success={formData.username && !fieldErrors.username}
                disabled={loading}
                readOnly={true} // Make it read-only since it auto-fills from email
                className="bg-gray-50 cursor-not-allowed dark:bg-gray-800/50" // Additional styling for read-only state
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Username is automatically set to match the email address
              </p>
              {fieldErrors.username && (
                <p className="mt-1.5 text-xs text-error-500">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password *
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.password}
                success={formData.password && !fieldErrors.password}
                disabled={loading}
                hint="Password must be at least 6 characters long"
              />
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-error-500">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                  loading
                    ? "text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40"
                    : fieldErrors.role
                      ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800"
                      : formData.role && !fieldErrors.role
                        ? "border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800"
                        : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                }`}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {fieldErrors.role && (
                <p className="mt-1.5 text-xs text-error-500">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || hasError}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating User...
                  </div>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>

          {/* Form Requirements */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg dark:bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Fields:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Full Name - User's complete name</li>
              <li>• Email - Valid email address</li>
              <li>• Username - Automatically matches email</li>
              <li>• Password - Minimum 6 characters</li>
              <li>• Role - User's role in the system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
