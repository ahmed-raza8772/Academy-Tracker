import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState, useRef } from "react";

// Import your custom components
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ComponentCard from "../../../components/common/ComponentCard";
import FileInput from "../../../components/form/input/FileInput";
import CustomDatePicker from "../../../components/form/input/DatePicker";
import { useAuthStore } from "../../../hooks/useAuth";
import Alert from "../../../components/ui/alert/Alert";
import MultiSelect from "../../../components/form/MultiSelect";
import { Modal } from "../../../components/ui/modal";
import SuccessMessage from "../../../components/ui/success/SuccessMessage";

export default function AddStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [alert, setAlert] = useState(false);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [buses, setBuses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const topRef = useRef(null);

  // Scroll to top when success message is shown
  useEffect(() => {
    if (showSuccess && topRef.current) {
      topRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showSuccess]);

  // Hardcoded schools data
  const hardcodedSchools = [
    {
      _id: "school1",
      schoolName: "Seoul International School",
      address: "123 Gangnam-gu, Seoul",
      phone: "+82-2-123-4567",
      email: "info@seoulis.edu",
    },
    {
      _id: "school2",
      schoolName: "Busan Global Academy",
      address: "456 Haeundae-gu, Busan",
      phone: "+82-51-765-4321",
      email: "contact@busanglobal.edu",
    },
    {
      _id: "school3",
      schoolName: "Daegu English Academy",
      address: "789 Jung-gu, Daegu",
      phone: "+82-53-888-9999",
      email: "admin@daeguenglish.edu",
    },
    {
      _id: "school4",
      schoolName: "Incheon Language School",
      address: "321 Yeonsu-gu, Incheon",
      phone: "+82-32-555-7777",
      email: "info@incheonlang.edu",
    },
  ];

  // Transform classes data for MultiSelect
  const classOptions = classes.map((cls) => ({
    value: cls._id,
    text: cls.className,
  }));

  // Transform courses data for MultiSelect
  const courseOptions = courses.map((crs) => ({
    value: crs._id,
    text: crs.courseName,
  }));

  // New state variables for field-specific validation errors
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Personal Information
    studentId: "",
    englishFirst: "",
    englishLast: "",
    koreanFamily: "",
    koreanGiven: "",
    sex: "",
    birthday: "",

    // Contact Information
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "South Korea",
    },
    studentPhone: "",
    motherPhone: "",
    fatherPhone: "",
    studentEmail: "",
    parentEmail: "",

    // School Information
    school: "",

    // Enrollment Information
    dateOfEnrollment: "",
    classRef: [],
    courses: [],
    classes: [],
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
    transportType: "walk",
    bus: "",
  });

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/Class/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/course/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching Courses:", error);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/bus/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching buses:", error);
      setBuses([
        { _id: "bus1", busName: "Bus 1", route: "Route A" },
        { _id: "bus2", busName: "Bus 2", route: "Route B" },
        { _id: "bus3", busName: "Bus 3", route: "Route C" },
      ]);
    }
  };

  const fetchSchools = async () => {
    try {
      // Using hardcoded data
      setSchools(hardcodedSchools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchools(hardcodedSchools);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchCourses();
    fetchBuses();
    fetchSchools();
  }, [API_URL, token]);

  // Handle regular input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "transportType") {
        if (value === "walk") {
          newFormData.bus = "";
        } else if (value === "bus" && !prev.bus && buses.length > 0) {
          newFormData.bus = buses[0]._id;
        }
      }

      return newFormData;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Handle new school input changes
  const handleNewSchoolChange = (e) => {
    const { name, value } = e.target;
    setNewSchoolData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding new school
  const handleAddNewSchool = () => {
    if (!newSchoolData.schoolName.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "School name is required!",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const newSchool = {
      _id: `school${Date.now()}`,
      schoolName: newSchoolData.schoolName.trim(),
      address: newSchoolData.schoolAddress.trim(),
      phone: newSchoolData.schoolPhone.trim(),
      email: newSchoolData.schoolEmail.trim(),
    };

    setSchools((prev) => [...prev, newSchool]);

    setFormData((prev) => ({
      ...prev,
      school: newSchool._id,
    }));

    setNewSchoolData({
      schoolName: "",
      schoolAddress: "",
      schoolPhone: "",
      schoolEmail: "",
    });
    setShowAddSchoolModal(false);

    setAlert({
      variant: "success",
      title: "Success",
      message: `"${newSchool.schoolName}" added successfully!`,
    });
    setTimeout(() => setAlert(null), 3000);
  };

  // Handle date picker changes specifically
  const handleDateChange = (fieldName) => (syntheticEvent) => {
    const date = syntheticEvent.target.value;
    const dateString = date ? date.toISOString().split("T")[0] : "";

    setFormData((prev) => ({
      ...prev,
      [fieldName]: dateString,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: null,
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

  // Handle class selection
  const handleClassSelection = (selectedClassIds) => {
    const selectedClassNames = selectedClassIds
      .map((classId) => {
        const selectedClass = classes.find((cls) => cls._id === classId);
        return selectedClass ? selectedClass.className : "";
      })
      .filter((name) => name !== "");

    setFormData((prev) => ({
      ...prev,
      classRef: selectedClassIds,
      classes: selectedClassNames,
    }));

    if (selectedClassIds.length > 0) {
      setErrors((prev) => ({ ...prev, classRef: "", classes: "" }));
    }
  };

  const handleCourseSelection = (selectedCourseIds) => {
    const selectedCourseNames = selectedCourseIds
      .map((courseId) => {
        const selectedCourse = courses.find((crs) => crs._id === courseId);
        return selectedCourse ? selectedCourse.courseName : "";
      })
      .filter((name) => name !== "");

    setFormData((prev) => ({
      ...prev,
      courses: selectedCourseIds,
    }));

    if (selectedCourseIds.length > 0) {
      setErrors((prev) => ({ ...prev, courses: "" }));
    }
  };

  // Improved validation function
  const validateForm = () => {
    const newErrors = {};

    // Personal Information Validation
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required!";
    }
    if (!formData.englishFirst.trim()) {
      newErrors.englishFirst = "English First Name is required!";
    }
    if (!formData.englishLast.trim()) {
      newErrors.englishLast = "English Last Name is required!";
    }
    if (!formData.sex) {
      newErrors.sex = "Gender is required!";
    }
    if (!formData.birthday) {
      newErrors.birthday = "Date of Birth is required!";
    }

    // Address Validation
    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required!";
    }
    if (!formData.address.city.trim()) {
      newErrors.city = "City is required!";
    }
    if (!formData.address.state.trim()) {
      newErrors.state = "State/Province is required!";
    }
    if (!formData.address.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required!";
    }

    // School Information Validation
    if (!formData.school) {
      newErrors.school = "Please select a school";
    }

    // Enrollment Information Validation
    if (!formData.dateOfEnrollment) {
      newErrors.dateOfEnrollment = "Date of Enrollment is required!";
    }
    if (formData.classRef.length === 0) {
      newErrors.classRef = "Please select at least one class";
    }
    if (formData.courses.length === 0) {
      newErrors.courses = "Please select at least one course";
    }
    if (formData.status === "") {
      newErrors.status = "Status is required!";
    }

    // transportType Validation
    if (formData.transportType === "bus" && !formData.bus) {
      newErrors.bus = "Please select a bus when transportType is by bus";
    }

    // Email validation (if provided)
    if (formData.studentEmail && !/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = "Please enter a valid email address";
    }
    if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }

    // Phone validation (if provided)
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (formData.studentPhone && !phoneRegex.test(formData.studentPhone)) {
      newErrors.studentPhone = "Please enter a valid phone number";
    }
    if (formData.motherPhone && !phoneRegex.test(formData.motherPhone)) {
      newErrors.motherPhone = "Please enter a valid phone number";
    }
    if (formData.fatherPhone && !phoneRegex.test(formData.fatherPhone)) {
      newErrors.fatherPhone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please fill out all required fields correctly.",
      });
      setTimeout(() => setAlert(null), 5000);
      setLoading(false);
      return;
    }

    try {
      // Prepare API data
      const apiData = {
        studentId: formData.studentId.trim(),
        englishFirst: formData.englishFirst.trim(),
        englishLast: formData.englishLast.trim(),
        koreanFamily: formData.koreanFamily.trim() || undefined,
        koreanGiven: formData.koreanGiven.trim() || undefined,
        sex: formData.sex,
        birthday: formData.birthday
          ? `${formData.birthday}T00:00:00.000Z`
          : undefined,

        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country || "South Korea",
        },

        studentPhone: formData.studentPhone?.trim() || undefined,
        motherPhone: formData.motherPhone?.trim() || undefined,
        fatherPhone: formData.fatherPhone?.trim() || undefined,
        studentEmail: formData.studentEmail?.trim() || undefined,
        parentEmail: formData.parentEmail?.trim() || undefined,

        dateOfEnrollment: formData.dateOfEnrollment
          ? `${formData.dateOfEnrollment}T00:00:00.000Z`
          : undefined,
        classRef: formData.classRef,
        courses: formData.courses,
        daysPreset: formData.daysPreset?.trim() || undefined,
        status: formData.status,
        days: formData.days,
        notes: formData.notes?.trim() || undefined,
        transportType: formData.transportType,
        bus: formData.transportType === "bus" ? formData.bus : undefined,
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

      // API call
      const response = await fetch(`${API_URL}/api/v1/student/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Reset form after successful submission
      setFormData({
        studentId: "",
        englishFirst: "",
        englishLast: "",
        koreanFamily: "",
        koreanGiven: "",
        sex: "",
        birthday: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "South Korea",
        },
        studentPhone: "",
        motherPhone: "",
        fatherPhone: "",
        studentEmail: "",
        parentEmail: "",
        school: "",
        dateOfEnrollment: "",
        classRef: [],
        courses: [],
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
        transportType: "walk",
        bus: "",
      });

      // Show success message
      setSuccessMessage(
        `Student "${formData.englishFirst} ${formData.englishLast}" has been successfully added to the system.`
      );
      setShowSuccess(true);
    } catch (error) {
      console.error("API Error:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to add student. Please try again.",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate selected days count for better UX
  const selectedDaysCount = Object.values(formData.days).filter(Boolean).length;

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

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 lg:px-8 lg:py-8">
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
        <div className="mb-6 text-center sm:mb-8">
          <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl lg:text-3xl">
            Add New Student
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Fill in the student details below to add a new student to the
            system.
          </p>
        </div>

        {/* Success Message */}
        <SuccessMessage
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Student Added Successfully"
          message={successMessage}
          autoClose={true}
          duration={6000}
        />

        {/* Main Form */}
        <ComponentCard className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Personal Information Section */}
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-xl dark:bg-blue-900/30 sm:w-10 sm:h-10 sm:mr-4">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 sm:w-5 sm:h-5"
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
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    Personal Information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    Basic student details and identification
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="sm:col-span-2">
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
                    error={!!errors.studentId}
                    hint={errors.studentId}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="image">Student Image</Label>
                  <FileInput id="image" type="file" name="image" />
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
                    error={!!errors.englishFirst}
                    hint={errors.englishFirst}
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
                    error={!!errors.englishLast}
                    hint={errors.englishLast}
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
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base ${
                      errors.sex
                        ? "border-error-500 focus:ring-error-500/20 dark:border-error-500"
                        : "border-gray-200 focus:ring-blue-500 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  {errors.sex && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.sex}
                    </p>
                  )}
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
                    error={!!errors.birthday}
                    hint={errors.birthday}
                  />
                </div>
              </div>
            </section>

            {/* School Information Section - IMPROVED RESPONSIVENESS */}
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 mr-3 bg-indigo-100 rounded-xl dark:bg-indigo-900/30 sm:w-10 sm:h-10 sm:mr-4">
                  <svg
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    School Information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    Select the student's school
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="school" required>
                    School
                  </Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base ${
                        errors.school
                          ? "border-error-500 focus:ring-error-500/20 dark:border-error-500"
                          : "border-gray-200 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                    >
                      <option value="">Select a School</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.schoolName}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddSchoolModal(true)}
                      className="whitespace-nowrap text-sm sm:text-base"
                    >
                      + Add New
                    </Button>
                  </div>
                  {errors.school && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.school}
                    </p>
                  )}
                  {formData.school && (
                    <div className="mt-2 p-2 text-xs bg-blue-50 rounded-lg dark:bg-blue-900/20 sm:p-3 sm:text-sm">
                      <p className="text-blue-800 dark:text-blue-200">
                        Selected:{" "}
                        {
                          schools.find((s) => s._id === formData.school)
                            ?.schoolName
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-xl dark:bg-green-900/30 sm:w-10 sm:h-10 sm:mr-4">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400 sm:w-5 sm:h-5"
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
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    Contact Information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    Student and parent contact details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Address Section */}
                <div className="sm:col-span-2">
                  <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="street" required>
                        Street
                      </Label>
                      <Input
                        id="street"
                        type="text"
                        name="street"
                        value={formData.address.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        placeholder="Sector A, Gangnam-gu"
                        error={!!errors.street}
                        hint={errors.street}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" required>
                        City
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.address.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        placeholder="Seoul"
                        error={!!errors.city}
                        hint={errors.city}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" required>
                        State/Province
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        name="state"
                        value={formData.address.state}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        placeholder="Seoul"
                        error={!!errors.state}
                        hint={errors.state}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" required>
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        name="postalCode"
                        value={formData.address.postalCode}
                        onChange={(e) =>
                          handleAddressChange("postalCode", e.target.value)
                        }
                        placeholder="60000"
                        error={!!errors.postalCode}
                        hint={errors.postalCode}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:col-span-2 sm:gap-6">
                  <div>
                    <Label htmlFor="studentPhone">Student Phone</Label>
                    <Input
                      id="studentPhone"
                      type="tel"
                      name="studentPhone"
                      value={formData.studentPhone}
                      onChange={handleChange}
                      placeholder="+82 10-1234-5678"
                      error={!!errors.studentPhone}
                      hint={errors.studentPhone}
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
                      error={!!errors.studentEmail}
                      hint={errors.studentEmail}
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
                      error={!!errors.motherPhone}
                      hint={errors.motherPhone}
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
                      error={!!errors.fatherPhone}
                      hint={errors.fatherPhone}
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
                      error={!!errors.parentEmail}
                      hint={errors.parentEmail}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Enrollment Information Section */}
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-xl dark:bg-purple-900/30 sm:w-10 sm:h-10 sm:mr-4">
                  <svg
                    className="w-4 h-4 text-purple-600 dark:text-purple-400 sm:w-5 sm:h-5"
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
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    Enrollment Information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    Class and enrollment details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                    error={!!errors.dateOfEnrollment}
                    hint={errors.dateOfEnrollment}
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
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base ${
                      errors.status
                        ? "border-error-500 focus:ring-error-500/20 dark:border-error-500"
                        : "border-gray-200 focus:ring-blue-500 dark:border-gray-600"
                    }`}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.status}
                    </p>
                  )}
                </div>

                {/* Class Selection */}
                <div className="sm:col-span-2">
                  <Label htmlFor="classRef" required>
                    Classes
                  </Label>
                  <div className="relative">
                    <MultiSelect
                      label=""
                      options={classOptions}
                      defaultSelected={formData.classRef}
                      onChange={handleClassSelection}
                      disabled={false}
                      hideSelectedItems={true} // NEW: Hide selected items from dropdown
                    />
                  </div>
                  {errors.classRef && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.classRef}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Select one or more classes for this student
                  </p>

                  {/* Display selected classes for confirmation */}
                  {formData.classRef.length > 0 && (
                    <div className="mt-3 p-2 text-xs bg-green-50 rounded-lg dark:bg-green-900/20 sm:p-3 sm:text-sm">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Selected Classes:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2 sm:gap-2">
                        {formData.classes.map((className, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md dark:bg-green-800/30 dark:text-green-200"
                          >
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Selection */}
                <div className="sm:col-span-2">
                  <Label htmlFor="courses" required>
                    Courses
                  </Label>
                  <div className="relative">
                    <MultiSelect
                      label=""
                      options={courseOptions}
                      defaultSelected={formData.courses}
                      onChange={handleCourseSelection}
                      disabled={false}
                      hideSelectedItems={true} // NEW: Hide selected items from dropdown
                    />
                  </div>
                  {errors.courses && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.courses}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Select one or more courses for this student
                  </p>

                  {/* Display selected courses for confirmation */}
                  {formData.courses.length > 0 && (
                    <div className="mt-3 p-2 text-xs bg-green-50 rounded-lg dark:bg-green-900/20 sm:p-3 sm:text-sm">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Selected Courses:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2 sm:gap-2">
                        {formData.courses.map((courseId, index) => {
                          const course = courses.find(
                            (c) => c._id === courseId
                          );
                          return course ? (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md dark:bg-green-800/30 dark:text-green-200"
                            >
                              {course.courseName}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
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
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-8 h-8 mr-3 bg-orange-100 rounded-xl dark:bg-orange-900/30 sm:w-10 sm:h-10 sm:mr-4">
                  <svg
                    className="w-4 h-4 text-orange-600 dark:text-orange-400 sm:w-5 sm:h-5"
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
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    Attendance Days
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    Select the days student will attend ({selectedDaysCount}{" "}
                    selected)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7 sm:gap-3">
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
                    className="flex flex-col items-center p-2 text-xs transition-all bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md dark:bg-gray-700 dark:border-gray-600 sm:p-3 sm:text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.days[day.key]}
                      onChange={(e) =>
                        handleDaysChange(day.key, e.target.checked)
                      }
                      className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500 sm:w-4 sm:h-4"
                    />
                    <span className="mt-1 font-medium text-gray-700 dark:text-gray-300 sm:mt-2">
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Allergic to peanuts. Needs special attention. Any other relevant information..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <Label htmlFor="transportType">Transport Type</Label>
                    <select
                      id="transportType"
                      name="transportType"
                      value={formData.transportType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base"
                    >
                      <option value="walk">By Walk</option>
                      <option value="bus">By Bus</option>
                    </select>
                  </div>

                  {formData.transportType === "bus" && (
                    <div>
                      <Label htmlFor="bus" required>
                        Choose Bus
                      </Label>
                      <select
                        id="bus"
                        name="bus"
                        value={formData.bus}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base ${
                          errors.bus
                            ? "border-error-500 focus:ring-error-500/20 dark:border-error-500"
                            : "border-gray-200 focus:ring-blue-500 dark:border-gray-600"
                        }`}
                      >
                        <option value="">Select a bus</option>
                        {buses.map((bus) => (
                          <option key={bus._id} value={bus._id}>
                            {bus.busName}{" "}
                            {bus.busNumber ? `- ${bus.busNumber}` : ""}
                          </option>
                        ))}
                      </select>
                      {errors.bus && (
                        <p className="mt-1.5 text-xs text-error-500">
                          {errors.bus}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:justify-end sm:pt-6 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full text-sm sm:w-auto sm:text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-sm sm:w-auto sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 mr-2 animate-spin sm:w-4 sm:h-4"
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

      {/* Add New School Modal */}
      <Modal
        isOpen={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
        className="max-w-md mx-4"
      >
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Add New School
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Add a new school to the system
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="schoolName" required>
                School Name
              </Label>
              <Input
                id="schoolName"
                type="text"
                name="schoolName"
                value={newSchoolData.schoolName}
                onChange={handleNewSchoolChange}
                placeholder="Enter school name"
              />
            </div>

            <div>
              <Label htmlFor="schoolAddress">School Address</Label>
              <Input
                id="schoolAddress"
                type="text"
                name="schoolAddress"
                value={newSchoolData.schoolAddress}
                onChange={handleNewSchoolChange}
                placeholder="Enter school address"
              />
            </div>

            <div>
              <Label htmlFor="schoolPhone">School Phone</Label>
              <Input
                id="schoolPhone"
                type="tel"
                name="schoolPhone"
                value={newSchoolData.schoolPhone}
                onChange={handleNewSchoolChange}
                placeholder="+82-2-123-4567"
              />
            </div>

            <div>
              <Label htmlFor="schoolEmail">School Email</Label>
              <Input
                id="schoolEmail"
                type="email"
                name="schoolEmail"
                value={newSchoolData.schoolEmail}
                onChange={handleNewSchoolChange}
                placeholder="school@example.com"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSchoolModal(false)}
              className="flex-1 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddNewSchool}
              className="flex-1 text-sm sm:text-base"
            >
              Add School
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
