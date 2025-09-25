import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import ComponentCard from "../../../components/common/ComponentCard";
import { useAuthStore } from "../../../hooks/useAuth";
import Alert from "../../../components/ui/alert/Alert";
import Loader from "../../../components/common/Loader";

export default function AddClasses() {
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    classCode: "",
    className: "",
    grade: "",
  });

  // ✅ state for showing alert
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (
      !formData.classCode.trim() ||
      !formData.className.trim() ||
      !formData.grade.trim()
    ) {
      setAlert({
        variant: "error",
        title: "Error",
        message: "All the fields are required.",
      });

      // ⏳ Auto-hide after 3 seconds
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/Classes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ keep inside headers
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create class");
      }

      const data = await response.json();
      console.log("Created:", data);

      setAlert({
        variant: "success",
        title: "Success",
        message: "Class has been created successfully!",
      });

      // ⏳ Auto-hide after 3 seconds
      setTimeout(() => setAlert(null), 3000);

      // Reset form
      setFormData({
        classCode: "",
        className: "",
        grade: "",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to add class. Try again!",
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
        title="Add Classes | TailAdmin"
        description="This is the Add Class page"
      />
      <PageBreadcrumb pageTitle="Add Class" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px]">
          <ComponentCard title="Class Details">
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
                <label
                  htmlFor="classCode"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Class Code
                </label>
                <Input
                  id="classCode"
                  name="classCode"
                  placeholder="Enter Class Code"
                  value={formData.classCode}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="className"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Class Name
                </label>
                <Input
                  id="className"
                  name="className"
                  placeholder="Enter Class Name"
                  value={formData.className}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="grade"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Grade
                </label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="Enter Grade"
                  value={formData.grade}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Save Class
              </button>
            </form>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
