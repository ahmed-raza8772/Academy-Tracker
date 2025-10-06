import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import ComponentCard from "../../../components/common/ComponentCard";
import { useAuthStore } from "../../../hooks/useAuth";
import { ChevronLeftIcon } from "../../../icons";
import Alert from "../../../components/ui/alert/Alert";
import Loader from "../../../components/common/Loader";
import Label from "../../../components/form/Label";
import { Link } from "react-router";

export default function AddBuses() {
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    busName: "",
    busNumber: "",
    status: true, // Default to active
  });

  // ✅ state for showing alert
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle status conversion from string to boolean
    if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (!formData.busName.trim() || !formData.busNumber.trim()) {
      setAlert({
        variant: "error",
        title: "Error",
        message: "All the fields are required.",
      });

      // ⏳ Auto-hide after 3 seconds
      setTimeout(() => setAlert(null), 2500);
      return;
    }

    setLoading(true);
    e.preventDefault();

    try {
      // Prepare data for API - status is already boolean
      const apiData = {
        busName: formData.busName.trim(),
        busNumber: formData.busNumber.trim(),
        status: formData.status, // This will be true or false
      };

      console.log("Sending data to backend:", apiData);

      const response = await fetch(`${API_URL}/api/v1/bus/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error("Failed to create bus");
      }

      const data = await response.json();
      console.log("Created:", data);

      setAlert({
        variant: "success",
        title: "Success",
        message: "Bus has been created successfully!",
      });

      // ⏳ Auto-hide after 3 seconds
      setTimeout(() => setAlert(null), 3000);

      // Reset form (keep status as true for next entry)
      setFormData({
        busName: "",
        busNumber: "",
        status: true,
      });
    } catch (error) {
      console.error("Error creating bus:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to add bus. Try again!",
      });

      // ⏳ Auto-hide after 3 seconds
      setTimeout(() => setAlert(null), 1500);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Add Bus | AE EduTracks"
        description="This is where you can add buses to the transportation system"
      />
      <PageBreadcrumb pageTitle="Add Bus" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Clean Back Link - No borders, no extra styling */}
        <div className="mb-6">
          <Link
            to="/Admin/Buses/Manage"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Buses
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[630px]">
          <ComponentCard title="Bus Details">
            {/* ✅ render alert when state exists */}
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

            <form className="space-y-5">
              <div>
                <Label htmlFor="busName" required>
                  Bus Name
                </Label>
                <Input
                  id="busName"
                  name="busName"
                  placeholder="Enter Bus Name (e.g., Morning Express, City Shuttle)"
                  value={formData.busName}
                  onChange={handleChange}
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Give the bus a descriptive name for easy identification
                </p>
              </div>

              <div>
                <Label htmlFor="busNumber" required>
                  Bus Number
                </Label>
                <Input
                  id="busNumber"
                  name="busNumber"
                  placeholder="Enter Bus Number (e.g., B001, 101)"
                  value={formData.busNumber}
                  onChange={handleChange}
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Unique identifier for the bus in your fleet
                </p>
              </div>

              {/* Status Dropdown */}
              <div>
                <Label htmlFor="status" required>
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status.toString()} // Convert boolean to string for select
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.status
                    ? "This bus will be active and available for student transportation"
                    : "This bus will be inactive and not available for transportation"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
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
                    Creating Bus...
                  </span>
                ) : (
                  "Save Bus"
                )}
              </button>
            </form>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
