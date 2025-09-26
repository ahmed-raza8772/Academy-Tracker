import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";

// Import your custom components
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ComponentCard from "../../../components/common/ComponentCard";
import FileInput from "../../../components/form/input/FileInput";
import CustomDatePicker from "../../../components/form/input/DatePicker";
import { useAuthStore } from "../../../hooks/useAuth";
import Alert from "../../../components/ui/alert/Alert";

export default function AddStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [alert, setAlert] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    studentId: "",
    englishFirst: "",
    englishLast: "",
    koreanFamily: "",
    koreanGiven: "",
    sex: "",
    birthday: "",
    grade: "",

    // Contact Information
    studentPhone: "",
    motherPhone: "",
    fatherPhone: "",
    studentEmail: "",
    parentEmail: "",

    // Enrollment Information
    dateOfEnrollment: "",
    classRef: "",
    daysPreset: "",
    status: true,

    // Attendance Days
    days: {
      M: false,
      T: false,
      W: false,
      Th: false,
      F: false,
      Sat: false,
      Sun: false,
    },

    // Additional
    notes: "",
    draft: false,
  });

  const [loading, setLoading] = useState(false);

  // Handle regular input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle date picker changes specifically
  const handleDateChange = (fieldName) => (syntheticEvent) => {
    const date = syntheticEvent.target.value;
    // Convert Date object to string in YYYY-MM-DD format
    const dateString = date ? date.toISOString().split("T")[0] : "";

    setFormData((prev) => ({
      ...prev,
      [fieldName]: dateString,
    }));
  };

  // Convert string dates back to Date objects for the date pickers
  const getDateValue = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };

  const handleDaysChange = (dayKey, checked) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: checked,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.studentId.trim()) {
      setLoading(false);
      return;
    }

    if (!formData.englishFirst.trim() || !formData.englishLast.trim()) {
      setAlert({
        variant: "info",
        title: "Oops!",
        message: "English name is required!",
      });
      setTimeout(() => setAlert(null), 3000);
      setLoading(false);
      return;
    }

    try {
      // Prepare API data - FLAT STRUCTURE like the backend expects
      const apiData = {
        studentId: formData.studentId.trim(),
        englishFirst: formData.englishFirst.trim(),
        englishLast: formData.englishLast.trim(),
        koreanFamily: formData.koreanFamily.trim() || undefined,
        koreanGiven: formData.koreanGiven.trim() || undefined,
        sex: formData.sex || undefined,
        birthday: formData.birthday
          ? `${formData.birthday}T00:00:00.000Z`
          : undefined,
        grade: formData.grade || undefined,
        studentPhone: formData.studentPhone?.trim() || undefined,
        motherPhone: formData.motherPhone?.trim() || undefined,
        fatherPhone: formData.fatherPhone?.trim() || undefined,
        studentEmail: formData.studentEmail?.trim() || undefined,
        parentEmail: formData.parentEmail?.trim() || undefined,
        dateOfEnrollment: formData.dateOfEnrollment
          ? `${formData.dateOfEnrollment}T00:00:00.000Z`
          : undefined,
        classRef: formData.classRef?.trim() || undefined,
        daysPreset: formData.daysPreset?.trim() || undefined,
        status: formData.status,
        days: formData.days,
        notes: formData.notes?.trim() || undefined,
        draft: formData.draft,
      };

      // Clean undefined values
      const cleanData = JSON.parse(
        JSON.stringify(apiData, (key, value) => {
          if (value === null || value === undefined || value === "")
            return undefined;
          return value;
        })
      );

      console.log("API Request Data:", cleanData);

      // API call with proper headers
      const response = await fetch(`${API_URL}/api/v1/student/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error(e);
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Student created successfully:", result);

      // Reset form after successful submission
      setFormData({
        studentId: "",
        englishFirst: "",
        englishLast: "",
        koreanFamily: "",
        koreanGiven: "",
        sex: "",
        birthday: "",
        grade: "",
        studentPhone: "",
        motherPhone: "",
        fatherPhone: "",
        studentEmail: "",
        parentEmail: "",
        dateOfEnrollment: "",
        classRef: "",
        daysPreset: "",
        status: true,
        days: {
          M: false,
          T: false,
          W: false,
          Th: false,
          F: false,
          Sat: false,
          Sun: false,
        },
        notes: "",
        draft: false,
      });
      setAlert({
        variant: "success",
        title: "Success",
        message: `${formData.englishFirst} ${formData.englishLast}" added successfully!`,
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error("API Error:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed Adding Student!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/students" },
    { label: "Add Student", href: "/students/add" },
  ];

  return (
    <div>
      <PageMeta
        title="Add Students | AE EduTracks"
        description="Add New Student information and student details from AE EduTracks portal"
      />
      <PageBreadcrumb pageTitle="Add Student" items={breadcrumbItems} />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section */}
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
        <div className="mb-8 text-center">
          <h3 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:text-3xl">
            Add New Student
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 lg:text-base">
            Fill in the student details below to add a new student to the
            system.
          </p>
        </div>

        {/* Main Form */}
        <ComponentCard className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <section className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 mr-4 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Basic student details and identification
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="studentId" required>
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="STU20250923001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Student Image</Label>
                  <FileInput
                    id="image"
                    type="file"
                    name="image"
                    placeholder=""
                  />
                </div>

                <div>
                  <Label htmlFor="grade" required>
                    Grade
                  </Label>
                  <Input
                    id="grade"
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="englishFirst" required>
                    English First Name
                  </Label>
                  <Input
                    id="englishFirst"
                    type="text"
                    name="englishFirst"
                    value={formData.englishFirst}
                    onChange={handleChange}
                    placeholder="Jeffery"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="englishLast" required>
                    English Last Name
                  </Label>
                  <Input
                    id="englishLast"
                    type="text"
                    name="englishLast"
                    value={formData.englishLast}
                    onChange={handleChange}
                    placeholder="Epstein"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="koreanFamily">Korean Family Name</Label>
                  <Input
                    id="koreanFamily"
                    type="text"
                    name="koreanFamily"
                    value={formData.koreanFamily}
                    onChange={handleChange}
                    placeholder="김"
                  />
                </div>

                <div>
                  <Label htmlFor="koreanGiven">Korean Given Name</Label>
                  <Input
                    id="koreanGiven"
                    type="text"
                    name="koreanGiven"
                    value={formData.koreanGiven}
                    onChange={handleChange}
                    placeholder="철수"
                  />
                </div>

                <div>
                  <Label htmlFor="sex" required>
                    Gender
                  </Label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div>
                  <CustomDatePicker
                    label="Date of Birth"
                    name="birthday"
                    selected={getDateValue(formData.birthday)}
                    onChange={handleDateChange("birthday")}
                    required
                    maxDate={new Date()}
                    placeholderText="Select date of birth"
                  />
                </div>
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 mr-4 bg-green-100 rounded-xl dark:bg-green-900/30">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Student and parent contact details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="studentPhone">Student Phone</Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleChange}
                    placeholder="+82 10-1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="studentEmail">Student Email</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="motherPhone">Mother's Phone</Label>
                  <Input
                    id="motherPhone"
                    type="tel"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    placeholder="+82 10-9876-5432"
                  />
                </div>

                <div>
                  <Label htmlFor="fatherPhone">Father's Phone</Label>
                  <Input
                    id="fatherPhone"
                    type="tel"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    placeholder="+82 10-5555-7777"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="parent@example.com"
                  />
                </div>
              </div>
            </section>

            {/* Enrollment Information Section */}
            <section className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 mr-4 bg-purple-100 rounded-xl dark:bg-purple-900/30">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Enrollment Information
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Class and enrollment details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dateOfEnrollment" required>
                    Date of Enrollment
                  </Label>
                  <CustomDatePicker
                    label=""
                    name="dateOfEnrollment"
                    selected={getDateValue(formData.dateOfEnrollment)}
                    onChange={handleDateChange("dateOfEnrollment")}
                    required
                    maxDate={new Date()}
                    placeholderText="Select enrollment date"
                  />
                </div>

                <div>
                  <Label htmlFor="status" required>
                    Status
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="classRef">Class Reference</Label>
                  <Input
                    id="classRef"
                    type="text"
                    name="classRef"
                    value={formData.classRef}
                    onChange={handleChange}
                    placeholder="68d16818fefbeae4346fd5d3"
                  />
                </div>

                <div>
                  <Label htmlFor="daysPreset">Days Preset</Label>
                  <Input
                    id="daysPreset"
                    type="text"
                    name="daysPreset"
                    value={formData.daysPreset}
                    onChange={handleChange}
                    placeholder="Mon–Fri"
                  />
                </div>
              </div>
            </section>

            {/* Attendance Days Section */}
            <section className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 mr-4 bg-orange-100 rounded-xl dark:bg-orange-900/30">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Attendance Days
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Select the days student will attend
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7">
                {[
                  { key: "M", label: "Mon" },
                  { key: "T", label: "Tue" },
                  { key: "W", label: "Wed" },
                  { key: "Th", label: "Thu" },
                  { key: "F", label: "Fri" },
                  { key: "Sat", label: "Sat" },
                  { key: "Sun", label: "Sun" },
                ].map((day) => (
                  <label
                    key={day.key}
                    className="flex flex-col items-center p-3 transition-all bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={formData.days[day.key]}
                      onChange={(e) =>
                        handleDaysChange(day.key, e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Allergic to peanuts. Needs special attention. Any other relevant information..."
                  />
                </div>

                <div className="sm:col-span-1">
                  <Label htmlFor="draft">Record Status</Label>
                  <select
                    id="draft"
                    name="draft"
                    value={formData.draft}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={false}>Finalized</option>
                    <option value={true}>Draft</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-6.364l-2.828 2.828M7.464 17.536l-2.828 2.828m11.314 0l-2.828-2.828M7.464 6.464L4.636 3.636"
                      />
                    </svg>
                    Adding Student...
                  </span>
                ) : (
                  "Add Student"
                )}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
