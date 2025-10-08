import { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { useAuthStore } from "../../../hooks/useAuth";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Alert from "../../../components/ui/alert/Alert";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import CustomDatePicker from "../../../components/form/input/DatePicker";
import Loader from "../../../components/common/Loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "../../../components/ui/table";

export default function ScheduleManagement() {
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  // State management
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]); // All teachers from API
  const [homeTeachers, setHomeTeachers] = useState([]); // Teachers with teacherType = "Home"
  const [otherTeachers, setOtherTeachers] = useState([]); // Teachers with teacherType = "Native" or "PartTime"
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    course: "",
    weekNumber: 1,
    startDate: "",
    endDate: "",
    teachers: ["", ""], // [homeTeacherId, otherTeacherId]
    scheduleSlots: [
      {
        day: "Monday",
        time: "09:00 - 10:00",
      },
    ],
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch all users and filter teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/createUser/getAll`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched users:", data);

      // Filter users where role = "teacher"
      const allTeachers = Array.isArray(data)
        ? data.filter((user) => user.role === "teacher")
        : [];

      setTeachers(allTeachers);

      // Separate teachers by teacherType
      const homeTeachersList = allTeachers.filter(
        (teacher) => teacher.teacherType === "Home"
      );
      const otherTeachersList = allTeachers.filter(
        (teacher) =>
          teacher.teacherType === "Native" || teacher.teacherType === "PartTime"
      );

      setHomeTeachers(homeTeachersList);
      setOtherTeachers(otherTeachersList);

      console.log("Home Teachers:", homeTeachersList);
      console.log("Other Teachers:", otherTeachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load teachers",
      });
    }
  };

  // Fetch courses and schedules
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
      console.error("Error fetching courses:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load courses",
      });
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/schedule/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
      console.log("Fetched schedules:", data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load schedules",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSchedules();
    fetchTeachers();
  }, [API_URL, token]);

  // Improved validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.course.trim()) {
      newErrors.course = "Please select a course";
    }

    if (
      !formData.weekNumber ||
      formData.weekNumber < 1 ||
      formData.weekNumber > 52
    ) {
      newErrors.weekNumber = "Week number must be between 1 and 52";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    // Validate teachers
    if (!formData.teachers[0]) {
      newErrors.homeTeacher = "Home teacher is required";
    }
    if (!formData.teachers[1]) {
      newErrors.otherTeacher = "Second teacher is required";
    }

    // Validate schedule slots
    formData.scheduleSlots.forEach((slot, index) => {
      if (!slot.day.trim()) {
        newErrors[`slot-${index}-day`] = "Day is required";
      }
      if (!slot.time.trim()) {
        newErrors[`slot-${index}-time`] = "Time slot is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weekNumber" ? parseInt(value) || "" : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle teacher selection changes
  const handleTeacherChange = (index, value) => {
    const updatedTeachers = [...formData.teachers];
    updatedTeachers[index] = value;

    setFormData((prev) => ({
      ...prev,
      teachers: updatedTeachers,
    }));

    // Clear teacher errors
    const errorKey = index === 0 ? "homeTeacher" : "otherTeacher";
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: null,
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (fieldName) => (syntheticEvent) => {
    const date = syntheticEvent.target.value;
    const dateString = date ? date.toISOString().split("T")[0] : "";

    setFormData((prev) => ({
      ...prev,
      [fieldName]: dateString,
    }));

    // Clear date errors
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  // Handle schedule slot changes
  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...formData.scheduleSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      scheduleSlots: updatedSlots,
    }));

    // Clear slot errors
    const errorKey = `slot-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: null,
      }));
    }
  };

  // Add new schedule slot
  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      scheduleSlots: [
        ...prev.scheduleSlots,
        { day: "Monday", time: "09:00 - 10:00" },
      ],
    }));
  };

  // Remove schedule slot
  const removeScheduleSlot = (index) => {
    if (formData.scheduleSlots.length > 1) {
      const updatedSlots = formData.scheduleSlots.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        scheduleSlots: updatedSlots,
      }));

      // Clean up related errors
      const newErrors = { ...errors };
      delete newErrors[`slot-${index}-day`];
      delete newErrors[`slot-${index}-time`];
      setErrors(newErrors);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      course: "",
      weekNumber: 1,
      startDate: "",
      endDate: "",
      teachers: ["", ""], // Reset to empty selections
      scheduleSlots: [
        {
          day: "Monday",
          time: "09:00 - 10:00",
        },
      ],
    });
    setErrors({});
  };

  // Handle modal close
  const handleModalClose = () => {
    if (!modalLoading) {
      setIsModalOpen(false);
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
      resetForm();
    }
  };

  // Handle view schedule
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      course: schedule.course,
      weekNumber: schedule.weekNumber,
      startDate: schedule.startDate ? schedule.startDate.split("T")[0] : "",
      endDate: schedule.endDate ? schedule.endDate.split("T")[0] : "",
      teachers: schedule.teachers || ["", ""],
      scheduleSlots: schedule.scheduleSlots.map((slot) => ({
        day: slot.day,
        time: slot.time,
      })),
    });
    setIsEditModalOpen(true);
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    if (!teacherId) return "Not selected";
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.fullname : "Unknown Teacher";
  };

  // Get teacher type by ID
  const getTeacherType = (teacherId) => {
    if (!teacherId) return "";
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.teacherType : "";
  };

  // Get teacher email by ID
  const getTeacherEmail = (teacherId) => {
    if (!teacherId) return "";
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.email : "";
  };

  // Handle form submission for create
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    setModalLoading(true);

    try {
      // Calculate dates based on week number if not provided
      let startDate = formData.startDate;
      let endDate = formData.endDate;

      if (!startDate || !endDate) {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const start = new Date(startOfYear);
        start.setDate(startOfYear.getDate() + (formData.weekNumber - 1) * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        startDate = start.toISOString().split("T")[0];
        endDate = end.toISOString().split("T")[0];
      }

      // Prepare API data - filter out empty teacher IDs
      const teacherIds = formData.teachers.filter((id) => id !== "");

      const apiData = {
        course: formData.course,
        weekNumber: formData.weekNumber,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        endDate: endDate ? `${endDate}T00:00:00.000Z` : undefined,
        teachers: teacherIds,
        scheduleSlots: formData.scheduleSlots,
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

      const response = await fetch(`${API_URL}/api/v1/schedule/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      resetForm();
      setIsModalOpen(false);

      setAlert({
        variant: "success",
        title: "Success",
        message: "Schedule created successfully!",
      });

      // Refresh schedules list
      await fetchSchedules();
    } catch (error) {
      console.error("API Error:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message:
          error.message || "Failed to create schedule. Please try again.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Handle update schedule
  const handleUpdateSchedule = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    setModalLoading(true);

    try {
      // Filter out empty teacher IDs
      const teacherIds = formData.teachers.filter((id) => id !== "");

      const apiData = {
        course: formData.course,
        weekNumber: formData.weekNumber,
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00.000Z`
          : undefined,
        endDate: formData.endDate
          ? `${formData.endDate}T00:00:00.000Z`
          : undefined,
        teachers: teacherIds,
        scheduleSlots: formData.scheduleSlots,
      };

      const cleanData = JSON.parse(
        JSON.stringify(apiData, (key, value) => {
          if (value === null || value === undefined || value === "")
            return undefined;
          return value;
        })
      );

      console.log("Update Request Data:", cleanData);

      const response = await fetch(
        `${API_URL}/api/v1/schedule/${selectedSchedule._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Update Response:", result);

      setIsEditModalOpen(false);
      setSelectedSchedule(null);

      setAlert({
        variant: "success",
        title: "Success",
        message: "Schedule updated successfully!",
      });

      await fetchSchedules();
    } catch (error) {
      console.error("Update Error:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message:
          error.message || "Failed to update schedule. Please try again.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Get date value for date picker
  const getDateValue = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find((c) => c._id === courseId);
    return course ? course.courseName : "Unknown Course";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Day options for dropdown
  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Time slot options
  const timeOptions = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
  ];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Schedule Management", href: "/schedule" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title="Manage Schedules | AE EduTracks"
        description="Create and manage course schedules, assign teachers, and
                  organize timetable slots efficiently."
      />
      <PageBreadcrumb pageTitle="Schedule Management" items={breadcrumbItems} />

      {/* Enhanced Header Content */}
      <div className="py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Schedule Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
              Create and manage course schedules, assign teachers, and organize
              timetable slots efficiently.
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Alert Section */}
          {alert && (
            <div className="mb-6">
              <Alert
                variant={alert.variant}
                title={alert.title}
                message={alert.message}
                showLink={false}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          {/* Schedules Table Card */}
          <ComponentCard
            title="Course Schedules"
            className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    All Schedules
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {schedules.length} schedule(s) found
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchSchedules();
                      fetchTeachers();
                    }}
                    disabled={loading}
                    className="whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Schedules Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Loading schedules...
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="max-w-full overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Course
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Week
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Date Range
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Teachers
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Schedule Slots
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Status
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {schedules.length > 0 ? (
                        schedules.map((schedule, index) => {
                          const isActive =
                            schedule.startDate &&
                            new Date(schedule.startDate) <= new Date() &&
                            schedule.endDate &&
                            new Date(schedule.endDate) >= new Date();

                          return (
                            <TableRow
                              key={schedule._id || index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {getCourseName(schedule.course)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {schedule.course}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Week {schedule.weekNumber}
                                </span>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                <div>
                                  <div>
                                    Start: {formatDate(schedule.startDate)}
                                  </div>
                                  <div>End: {formatDate(schedule.endDate)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="space-y-1 max-w-xs">
                                  {schedule.teachers?.map(
                                    (teacherId, teacherIndex) => (
                                      <div
                                        key={teacherIndex}
                                        className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                                      >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                          {getTeacherName(teacherId)}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {getTeacherType(teacherId)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="space-y-1 max-w-xs">
                                  {schedule.scheduleSlots?.map(
                                    (slot, slotIndex) => (
                                      <div
                                        key={slot._id || slotIndex}
                                        className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                                      >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                          {slot.day}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {slot.time}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isActive
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewSchedule(schedule)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSchedule(schedule)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="px-6 py-12 text-center"
                          >
                            <div className="text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No schedules
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Get started by creating a new schedule.
                              </p>
                              <div className="mt-6">
                                <Button onClick={() => setIsModalOpen(true)}>
                                  Create New Schedule
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </ComponentCard>
        </div>
      </div>

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        className="max-w-4xl mx-4"
      >
        <div className="relative w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800">
          {/* Enhanced Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/30">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Schedule
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Add a new course schedule with timetable slots
                </p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              disabled={modalLoading}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            ></button>
          </div>

          {/* Built-in Loader */}
          {modalLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 z-10 rounded-xl">
              <div className="text-center">
                <Loader />
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Creating schedule...
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Course Selection */}
              <div>
                <Label
                  htmlFor="course"
                  required
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Course
                </Label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.course
                      ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                  }`}
                  required
                  disabled={modalLoading}
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName}{" "}
                      {course.courseCode ? `(${course.courseCode})` : ""}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.course}
                  </p>
                )}
              </div>

              {/* Week Number and Date Range */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="weekNumber"
                    required
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Week Number
                  </Label>
                  <Input
                    id="weekNumber"
                    type="number"
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleChange}
                    min="1"
                    max="52"
                    required
                    disabled={modalLoading}
                    error={!!errors.weekNumber}
                    hint={errors.weekNumber}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Start Date (Optional)
                  </Label>
                  <CustomDatePicker
                    label=""
                    name="startDate"
                    selected={getDateValue(formData.startDate)}
                    onChange={handleDateChange("startDate")}
                    placeholderText="Select start date"
                    disabled={modalLoading}
                    error={!!errors.startDate}
                    hint={errors.startDate}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="endDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    End Date (Optional)
                  </Label>
                  <CustomDatePicker
                    label=""
                    name="endDate"
                    selected={getDateValue(formData.endDate)}
                    onChange={handleDateChange("endDate")}
                    placeholderText="Select end date"
                    disabled={modalLoading}
                    error={!!errors.endDate}
                    hint={errors.endDate}
                  />
                </div>
              </div>

              {/* Teacher Selection Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="mb-6">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Teacher Assignment
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Assign teachers to this schedule
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Teacher (Fixed) */}
                  <div>
                    <Label
                      htmlFor="homeTeacher"
                      required
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Home Teacher (Required)
                    </Label>
                    <select
                      id="homeTeacher"
                      value={formData.teachers[0] || ""}
                      onChange={(e) => handleTeacherChange(0, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.homeTeacher
                          ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                          : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                      required
                      disabled={modalLoading}
                    >
                      <option value="">Select Home Teacher...</option>
                      {homeTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullname} - {teacher.teacherType}
                        </option>
                      ))}
                    </select>
                    {errors.homeTeacher && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.homeTeacher}
                      </p>
                    )}
                    {homeTeachers.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                        No Home teachers available
                      </p>
                    )}
                  </div>

                  {/* Second Teacher (Native/PartTime) */}
                  <div>
                    <Label
                      htmlFor="otherTeacher"
                      required
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Second Teacher (Required)
                    </Label>
                    <select
                      id="otherTeacher"
                      value={formData.teachers[1] || ""}
                      onChange={(e) => handleTeacherChange(1, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.otherTeacher
                          ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                          : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                      required
                      disabled={modalLoading}
                    >
                      <option value="">Select Second Teacher...</option>
                      {otherTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullname} - {teacher.teacherType}
                        </option>
                      ))}
                    </select>
                    {errors.otherTeacher && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.otherTeacher}
                      </p>
                    )}
                    {otherTeachers.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                        No Native or PartTime teachers available
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Teachers Preview */}
                {(formData.teachers[0] || formData.teachers[1]) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Selected Teachers:
                    </h5>
                    <div className="space-y-2">
                      {formData.teachers[0] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 dark:text-green-400">
                            Home Teacher:
                          </span>
                          <span className="font-medium text-green-800 dark:text-green-300">
                            {getTeacherName(formData.teachers[0])}
                          </span>
                        </div>
                      )}
                      {formData.teachers[1] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 dark:text-green-400">
                            Second Teacher:
                          </span>
                          <span className="font-medium text-green-800 dark:text-green-300">
                            {getTeacherName(formData.teachers[1])}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Slots Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Schedule Slots
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Add class sessions for this schedule
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleSlot}
                    disabled={modalLoading}
                    className="bg-white dark:bg-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Slot
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.scheduleSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Session {index + 1}
                        </h5>
                        {formData.scheduleSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeScheduleSlot(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={modalLoading}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor={`day-${index}`}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Day
                          </Label>
                          <select
                            id={`day-${index}`}
                            value={slot.day}
                            onChange={(e) =>
                              handleSlotChange(index, "day", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              errors[`slot-${index}-day`]
                                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                            }`}
                            disabled={modalLoading}
                          >
                            {dayOptions.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          {errors[`slot-${index}-day`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`slot-${index}-day`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor={`time-${index}`}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Time Slot
                          </Label>
                          <select
                            id={`time-${index}`}
                            value={slot.time}
                            onChange={(e) =>
                              handleSlotChange(index, "time", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              errors[`slot-${index}-time`]
                                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                            }`}
                            disabled={modalLoading}
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          {errors[`slot-${index}-time`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`slot-${index}-time`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={modalLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading || !formData.course}
                className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              >
                {modalLoading ? (
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
                    Creating Schedule...
                  </span>
                ) : (
                  "Create Schedule"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Schedule Modal - Updated to show teacher names */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleModalClose}
        className="max-w-2xl mx-4"
      >
        <div className="relative w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/30">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Schedule Details
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  View schedule information
                </p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            ></button>
          </div>

          {selectedSchedule && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getCourseName(selectedSchedule.course)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ID: {selectedSchedule.course}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Week Number
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Week {selectedSchedule.weekNumber}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedSchedule.startDate)}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedSchedule.endDate)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Assigned Teachers
                </Label>
                <div className="space-y-3">
                  {selectedSchedule.teachers?.map((teacherId, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getTeacherName(teacherId)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({getTeacherType(teacherId)})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTeacherEmail(teacherId)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Schedule Slots
                </Label>
                <div className="space-y-3">
                  {selectedSchedule.scheduleSlots?.map((slot, index) => (
                    <div
                      key={slot._id || index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {slot.day}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {slot.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
            <Button onClick={handleModalClose}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Schedule Modal - Updated with teacher selection */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        className="max-w-4xl mx-4"
      >
        <div className="relative w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/30">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Schedule
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Update schedule information
                </p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              disabled={modalLoading}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            ></button>
          </div>

          {modalLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 z-10 rounded-xl">
              <div className="text-center">
                <Loader />
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Updating schedule...
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleUpdateSchedule}
            className="max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Course Selection */}
              <div>
                <Label
                  htmlFor="edit-course"
                  required
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Course
                </Label>
                <select
                  id="edit-course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.course
                      ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                  }`}
                  required
                  disabled={modalLoading}
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName}{" "}
                      {course.courseCode ? `(${course.courseCode})` : ""}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.course}
                  </p>
                )}
              </div>

              {/* Week Number and Date Range */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="edit-weekNumber"
                    required
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Week Number
                  </Label>
                  <Input
                    id="edit-weekNumber"
                    type="number"
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleChange}
                    min="1"
                    max="52"
                    required
                    disabled={modalLoading}
                    error={!!errors.weekNumber}
                    hint={errors.weekNumber}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-startDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Start Date (Optional)
                  </Label>
                  <CustomDatePicker
                    label=""
                    name="startDate"
                    selected={getDateValue(formData.startDate)}
                    onChange={handleDateChange("startDate")}
                    placeholderText="Select start date"
                    disabled={modalLoading}
                    error={!!errors.startDate}
                    hint={errors.startDate}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-endDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    End Date (Optional)
                  </Label>
                  <CustomDatePicker
                    label=""
                    name="endDate"
                    selected={getDateValue(formData.endDate)}
                    onChange={handleDateChange("endDate")}
                    placeholderText="Select end date"
                    disabled={modalLoading}
                    error={!!errors.endDate}
                    hint={errors.endDate}
                  />
                </div>
              </div>

              {/* Teacher Selection Section for Edit */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="mb-6">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Teacher Assignment
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Update teacher assignments for this schedule
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Teacher (Fixed) */}
                  <div>
                    <Label
                      htmlFor="edit-homeTeacher"
                      required
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Home Teacher (Required)
                    </Label>
                    <select
                      id="edit-homeTeacher"
                      value={formData.teachers[0] || ""}
                      onChange={(e) => handleTeacherChange(0, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.homeTeacher
                          ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                          : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                      required
                      disabled={modalLoading}
                    >
                      <option value="">Select Home Teacher...</option>
                      {homeTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullname} - {teacher.teacherType}
                        </option>
                      ))}
                    </select>
                    {errors.homeTeacher && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.homeTeacher}
                      </p>
                    )}
                  </div>

                  {/* Second Teacher (Native/PartTime) */}
                  <div>
                    <Label
                      htmlFor="edit-otherTeacher"
                      required
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Second Teacher (Required)
                    </Label>
                    <select
                      id="edit-otherTeacher"
                      value={formData.teachers[1] || ""}
                      onChange={(e) => handleTeacherChange(1, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.otherTeacher
                          ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                          : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                      required
                      disabled={modalLoading}
                    >
                      <option value="">Select Second Teacher...</option>
                      {otherTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullname} - {teacher.teacherType}
                        </option>
                      ))}
                    </select>
                    {errors.otherTeacher && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.otherTeacher}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Teachers Preview */}
                {(formData.teachers[0] || formData.teachers[1]) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Selected Teachers:
                    </h5>
                    <div className="space-y-2">
                      {formData.teachers[0] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 dark:text-green-400">
                            Home Teacher:
                          </span>
                          <span className="font-medium text-green-800 dark:text-green-300">
                            {getTeacherName(formData.teachers[0])}
                          </span>
                        </div>
                      )}
                      {formData.teachers[1] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 dark:text-green-400">
                            Second Teacher:
                          </span>
                          <span className="font-medium text-green-800 dark:text-green-300">
                            {getTeacherName(formData.teachers[1])}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Slots Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Schedule Slots
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Update class sessions for this schedule
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleSlot}
                    disabled={modalLoading}
                    className="bg-white dark:bg-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Slot
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.scheduleSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Session {index + 1}
                        </h5>
                        {formData.scheduleSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeScheduleSlot(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={modalLoading}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor={`edit-day-${index}`}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Day
                          </Label>
                          <select
                            id={`edit-day-${index}`}
                            value={slot.day}
                            onChange={(e) =>
                              handleSlotChange(index, "day", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              errors[`slot-${index}-day`]
                                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                            }`}
                            disabled={modalLoading}
                          >
                            {dayOptions.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          {errors[`slot-${index}-day`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`slot-${index}-day`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor={`edit-time-${index}`}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Time Slot
                          </Label>
                          <select
                            id={`edit-time-${index}`}
                            value={slot.time}
                            onChange={(e) =>
                              handleSlotChange(index, "time", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              errors[`slot-${index}-time`]
                                ? "border-red-300 focus:ring-red-500 dark:border-red-600"
                                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                            }`}
                            disabled={modalLoading}
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          {errors[`slot-${index}-time`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`slot-${index}-time`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={modalLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading || !formData.course}
                className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                {modalLoading ? (
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
                    Updating Schedule...
                  </span>
                ) : (
                  "Update Schedule"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
