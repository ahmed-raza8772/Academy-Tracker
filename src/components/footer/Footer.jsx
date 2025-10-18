// components/footer/Footer.jsx
const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-b-2xl">
      <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        {/* Left Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            AE EduTracks
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Empowering schools, teachers, and parents with smart academic
            tracking.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            Contact Us
          </a>
        </div>

        {/* Right Section */}
        <div className="mt-4 md:mt-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Designed & Developed by{" "}
            <a
              href="https://github.com/ahmed-raza8772"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Ahmed Raza
            </a>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            © {new Date().getFullYear()} AE EduTracks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
