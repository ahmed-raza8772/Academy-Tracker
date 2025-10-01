import { useState, useEffect, useRef } from "react";

const MultiSelect = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
  hideSelectedItems = false, // NEW: Prop to hide selected items from dropdown
}) => {
  const [selectedOptions, setSelectedOptions] = useState(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const removeOption = (value, e) => {
    e.stopPropagation();
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  // Filter options if hideSelectedItems is true
  const filteredOptions = hideSelectedItems
    ? options.filter((option) => !selectedOptions.includes(option.value))
    : options;

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {/* Trigger Area */}
        <div
          ref={triggerRef}
          onClick={toggleDropdown}
          className="w-full cursor-pointer"
        >
          <div className="flex min-h-11 rounded-lg border border-gray-300 py-2 pl-3 pr-3 shadow-theme-xs outline-none transition focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300">
            <div className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
              {selectedValuesText.length > 0 ? (
                <>
                  {/* Show first 2-3 selected items with ability to remove */}
                  {selectedValuesText.slice(0, 3).map((text, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-700"
                    >
                      <span className="flex-initial max-w-[120px] truncate">
                        {text}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => removeOption(selectedOptions[index], e)}
                        className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg
                          className="h-3 w-3 fill-current"
                          viewBox="0 0 14 14"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Show +X more for additional selections */}
                  {selectedValuesText.length > 3 && (
                    <div className="flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      +{selectedValuesText.length - 3} more
                    </div>
                  )}
                </>
              ) : (
                // Empty state - no placeholder text
                <div className="min-h-[20px]"></div>
              )}
            </div>

            <div className="flex items-center w-6 ml-2">
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-50 w-full mt-1 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 top-full max-h-60 overflow-y-auto dark:bg-gray-900 dark:border-gray-700"
          >
            <div className="flex flex-col py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSelect(option.value)}
                  >
                    <div
                      className={`flex items-center justify-center w-4 h-4 mr-3 border rounded ${
                        selectedOptions.includes(option.value)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selectedOptions.includes(option.value) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.text}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
