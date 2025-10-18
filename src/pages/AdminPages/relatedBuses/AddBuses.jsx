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
import { FaBus, FaCheck, FaUser, FaUsers } from "react-icons/fa";
import { Link } from "react-router";
import Footer from "../../../components/footer/Footer";

export default function AddBuses() {
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    busName: "",
    busNumber: "",
    status: true, // Default to active
    driverName: "",
    driverAge: "",
    driverArcNumber: "",
    driverLicenceNumber: "",
    helperName: "",
    helperNumber: "",
    helperAge: "",
    helperArcNumber: "",
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

  const validateForm = () => {
    const requiredFields = [
      "busName",
      "busNumber",
      "driverName",
      "driverAge",
      "driverArcNumber",
      "driverLicenceNumber",
      "helperName",
      "helperNumber",
      "helperAge",
      "helperArcNumber",
    ];

    const emptyFields = requiredFields.filter(
      (field) => !formData[field]?.trim()
    );

    if (emptyFields.length > 0) {
      setAlert({
        variant: "error",
        title: "Error",
        message: "All fields are required. Please fill in all the information.",
      });
      setTimeout(() => setAlert(null), 2500);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API - status is already boolean
      const apiData = {
        busName: formData.busName.trim(),
        busNumber: formData.busNumber.trim(),
        status: formData.status,
        driverName: formData.driverName.trim(),
        driverAge: formData.driverAge.trim(),
        driverArcNumber: formData.driverArcNumber.trim(),
        driverLicenceNumber: formData.driverLicenceNumber.trim(),
        helperName: formData.helperName.trim(),
        helperNumber: formData.helperNumber.trim(),
        helperAge: formData.helperAge.trim(),
        helperArcNumber: formData.helperArcNumber.trim(),
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
        driverName: "",
        driverAge: "",
        driverArcNumber: "",
        driverLicenceNumber: "",
        helperName: "",
        helperNumber: "",
        helperAge: "",
        helperArcNumber: "",
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

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] xl:p-8">
        {/* Clean Back Link */}
        <div className="mb-8">
          <Link
            to="/Admin/Buses/Manage"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 hover:gap-3 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeftIcon className="w-4 h-4 transition-transform" />
            Back to Buses
          </Link>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <ComponentCard
            title="Add New Bus"
            className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
          >
            {/* Alert Section */}
            {alert && (
              <div className="mb-6 animate-fade-in">
                <Alert
                  variant={alert.variant}
                  title={alert.title}
                  message={alert.message}
                  showLink={false}
                />
              </div>
            )}

            <form className="space-y-6">
              {/* Basic Bus Information */}
              <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-xs dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                    <FaBus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Bus Information
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="busName" required className="mb-2">
                      Bus Name
                    </Label>
                    <Input
                      id="busName"
                      name="busName"
                      placeholder="Enter Bus Name (e.g., Route-03, Morning Express)"
                      value={formData.busName}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Give the bus a descriptive name for easy identification
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="busNumber" required className="mb-2">
                      Bus Number
                    </Label>
                    <Input
                      id="busNumber"
                      name="busNumber"
                      placeholder="Enter Bus Number (e.g., 90238, B001)"
                      value={formData.busNumber}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Unique identifier for the bus in your fleet
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <Label htmlFor="status" required className="mb-2">
                      Status
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status.toString()}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <p
                      className={`mt-2 text-sm ${formData.status ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                    >
                      {formData.status
                        ? "✓ This bus will be active and available for student transportation"
                        : "⚠ This bus will be inactive and not available for transportation"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-xs dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg dark:bg-green-900/30">
                    <FaUser className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Driver Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="driverName" required className="mb-2">
                      Driver Name
                    </Label>
                    <Input
                      id="driverName"
                      name="driverName"
                      placeholder="Enter driver's full name"
                      value={formData.driverName}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverAge" required className="mb-2">
                      Driver Age
                    </Label>
                    <Input
                      id="driverAge"
                      name="driverAge"
                      placeholder="Enter driver's age"
                      value={formData.driverAge}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverArcNumber" required className="mb-2">
                      Driver ARC Number
                    </Label>
                    <Input
                      id="driverArcNumber"
                      name="driverArcNumber"
                      placeholder="Enter ARC number"
                      value={formData.driverArcNumber}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="driverLicenceNumber"
                      required
                      className="mb-2"
                    >
                      Driver Licence Number
                    </Label>
                    <Input
                      id="driverLicenceNumber"
                      name="driverLicenceNumber"
                      placeholder="Enter licence number"
                      value={formData.driverLicenceNumber}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Helper Information */}
              <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-xs dark:bg-gray-800/50 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                    <FaUsers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Helper Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="helperName" required className="mb-2">
                      Helper Name
                    </Label>
                    <Input
                      id="helperName"
                      name="helperName"
                      placeholder="Enter helper's full name"
                      value={formData.helperName}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="helperNumber" required className="mb-2">
                      Helper Number
                    </Label>
                    <Input
                      id="helperNumber"
                      name="helperNumber"
                      placeholder="Enter contact number"
                      value={formData.helperNumber}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="helperAge" required className="mb-2">
                      Helper Age
                    </Label>
                    <Input
                      id="helperAge"
                      name="helperAge"
                      placeholder="Enter helper's age"
                      value={formData.helperAge}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="helperArcNumber" required className="mb-2">
                      Helper ARC Number
                    </Label>
                    <Input
                      id="helperArcNumber"
                      name="helperArcNumber"
                      placeholder="Enter ARC number"
                      value={formData.helperArcNumber}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-3 animate-spin"
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
                  <span className="flex items-center justify-center">
                    <FaCheck className="w-5 h-5 mr-2" />
                    Save Bus Information
                  </span>
                )}
              </button>
            </form>
          </ComponentCard>
        </div>
      </div>
      <Footer />
    </div>
  );
}
