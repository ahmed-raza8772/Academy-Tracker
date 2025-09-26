// hooks/useDatePicker.js
import { useState, useCallback } from "react";

export const useDatePicker = (initialValue = null) => {
  const [date, setDate] = useState(initialValue);

  const handleDateChange = useCallback((syntheticEvent) => {
    setDate(syntheticEvent.target.value);
  }, []);

  const resetDate = useCallback(() => {
    setDate(null);
  }, []);

  return {
    date,
    handleDateChange,
    resetDate,
    setDate,
  };
};
