// components/common/DatePicker.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({
  label,
  name,
  selected,
  onChange,
  required = false,
  disabled = false,
  placeholderText = "Select date",
  minDate = null,
  maxDate = null,
  showTimeSelect = false,
  dateFormat = "yyyy-MM-dd",
  timeFormat = "HH:mm",
  timeIntervals = 30,
  showYearDropdown = true,
  showMonthDropdown = true,
  dropdownMode = "select",
  className = "",
  labelClassName = "",
  error = null,
  ...props
}) => {
  const handleChange = (date) => {
    if (onChange) {
      // Create a synthetic event object to match the expected format
      const syntheticEvent = {
        target: {
          name: name,
          value: date,
          type: "date",
        },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <DatePicker
        id={name}
        selected={selected}
        onChange={handleChange}
        disabled={disabled}
        placeholderText={placeholderText}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        dateFormat={showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        dropdownMode={dropdownMode}
        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
          error ? "border-red-500 focus:ring-red-500" : ""
        }`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CustomDatePicker;
