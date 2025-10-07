import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function ExternalLoginCredentials({ studentId }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudentCredentials = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch specific student by ID
        const response = await fetch(`${API_URL}/api/v1/student/${studentId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch student data");

        const studentData = await response.json();

        if (studentData && studentData.externalLoginCredential) {
          setCredentials(studentData.externalLoginCredential);
        } else {
          setCredentials([]);
        }
      } catch (error) {
        console.error("Error fetching student credentials:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentCredentials();
    } else {
      setLoading(false);
      setError("No student ID provided");
    }
  }, [studentId, token, API_URL]);

  // Toggle password visibility
  const togglePasswordVisibility = (index) => {
    setShowPassword((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Copy to clipboard function
  const copyToClipboard = (text, fieldName) => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You can add a toast notification here if needed
        console.log(`${fieldName} copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-center">
          <div className="text-red-500">Error loading credentials: {error}</div>
        </div>
      </div>
    );
  }

  // No credentials state
  if (!credentials || credentials.length === 0) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          External Login Credentials
        </h4>
        <div className="flex justify-center py-8">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No external login credentials available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          External Login Credentials
        </h4>
        <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
          {credentials.length}{" "}
          {credentials.length === 1 ? "Credential" : "Credentials"}
        </span>
      </div>

      <div className="space-y-4">
        {credentials.map((credential, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-800 dark:text-white/90">
                {credential.websiteName || `Credential ${index + 1}`}
              </h5>
              {credential.link && (
                <a
                  href={credential.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Visit
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Website Link */}
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Website Link
                </p>
                <div className="flex items-center">
                  <p className="flex-1 text-sm text-gray-800 dark:text-white/90 break-all">
                    {credential.link || "N/A"}
                  </p>
                  {credential.link && (
                    <button
                      onClick={() =>
                        copyToClipboard(credential.link, "Website link")
                      }
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy link"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Email/Username */}
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email/Username
                </p>
                <div className="flex items-center">
                  <p className="flex-1 text-sm text-gray-800 dark:text-white/90 break-all">
                    {credential.emailOrUsername || "N/A"}
                  </p>
                  {credential.emailOrUsername && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          credential.emailOrUsername,
                          "Email/Username"
                        )
                      }
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy email/username"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Password
                </p>
                <div className="flex items-center">
                  <p className="flex-1 text-sm text-gray-800 dark:text-white/90 break-all">
                    {credential.password
                      ? showPassword[index]
                        ? credential.password
                        : "•".repeat(8)
                      : "N/A"}
                  </p>
                  {credential.password && (
                    <div className="flex items-center ml-2 space-x-1">
                      <button
                        onClick={() => togglePasswordVisibility(index)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={
                          showPassword[index]
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {showPassword[index] ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(credential.password, "Password")
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy password"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex">
          <svg
            className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            These credentials are stored securely. Please handle this sensitive
            information with care.
          </p>
        </div>
      </div>
    </div>
  );
}
