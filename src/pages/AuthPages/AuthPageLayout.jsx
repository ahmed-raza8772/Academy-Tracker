import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import auth_logo from "../../assets/images/logo/auth-logo.svg";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* ===== Common Grid Shape Start ===== */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <img width={231} height={48} src={auth_logo} alt="Logo" />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                A smart student management portal that helps schools track
                academic progress, while parents can view their child’s reports,
                grades, and performance in real time.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
