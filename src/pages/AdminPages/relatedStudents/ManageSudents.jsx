import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Loader from "../../../components/common/Loader";
import ComponentCard from "../../../components/common/ComponentCard";
import { useAuthStore } from "../../../hooks/useAuth";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Alert from "../../../components/ui/alert/Alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "../../../components/ui/table";
import ConfirmationModal from "../../../components/form/ConfirmationModal";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { useNavigate } from "react-router";

export default function ManageStudents() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [alert, setAlert] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [formData, setFormData] = useState({
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
    draft: false,
    notes: "",
    days: {
      M: false,
      T: false,
      W: false,
      Th: false,
      F: false,
      Sat: false,
      Sun: false,
    },
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/student/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching Students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [API_URL, token]);

  const handleView = (id) => {
    navigate(`/Admin/Students/${id}`);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    if (!studentToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/student/${studentToDelete._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: false,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentToDelete._id ? { ...s, status: false } : s
          )
        );

        setAlert({
          variant: "success",
          title: "Success",
          message: "Student deactivated successfully!",
        });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error("Failed to update status:", data);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed deactivating student!",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error deactivating student!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDaysChange = (dayKey, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: isChecked,
      },
    }));
  };

  const handleUpdate = (student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId || "",
      englishFirst: student.englishFirst || "",
      englishLast: student.englishLast || "",
      koreanFamily: student.koreanFamily || "",
      koreanGiven: student.koreanGiven || "",
      sex: student.sex || "",
      birthday: student.birthday || "",
      grade: student.grade || "",
      studentPhone: student.studentPhone || "",
      motherPhone: student.motherPhone || "",
      fatherPhone: student.fatherPhone || "",
      studentEmail: student.studentEmail || "",
      parentEmail: student.parentEmail || "",
      dateOfEnrollment: student.dateOfEnrollment || "",
      classRef: student.classRef || "",
      daysPreset: student.daysPreset || "",
      status: student.status !== undefined ? student.status : true,
      draft: student.draft !== undefined ? student.draft : false,
      notes: student.notes || "",
      days: student.days || {
        M: false,
        T: false,
        W: false,
        Th: false,
        F: false,
        Sat: false,
        Sun: false,
      },
    });
    setIsUpdateOpen(true);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/student/${selectedStudent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchStudents(); // Refresh the list
        setAlert({
          variant: "success",
          title: "Success",
          message: "Student updated successfully!",
        });
        setTimeout(() => setAlert(null), 3000);
        setIsUpdateOpen(false);
      } else {
        console.error("Failed to update student:", data);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed updating student!",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error updating student!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      if (term === "active" || term === "not active" || term === "inactive") {
        const statusLabel = student.status ? "active" : "not active";
        return statusLabel.includes(term);
      }

      return Object.values(student).some((val) =>
        String(val).toLowerCase().includes(term)
      );
    });
  }, [searchTerm, students]);

  // Calculate total number of pages
  const totalPages = Math.max(Math.ceil(filteredData.length / rowsPerPage), 1);

  // 📄 Pagination
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 🐛 Page reset logic
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    } else if (filteredData.length === 0) {
      setPage(0);
    }
  }, [totalPages, page, filteredData.length]);

  if (loading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Manage Students | AE EduTracks"
        description="Manage Student information and student details from AE EduTracks portal"
      />
      <PageBreadcrumb pageTitle="Students" />

      <div className="space-y-6">
        <ComponentCard title="List of Students">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
            <Input
              type="text"
              placeholder="Search by ID, Name or status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="sm:w-1/3"
            />
          </div>

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

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider sm:px-6"
                      >
                        Student ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        이름
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        English Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((student, index) => (
                        <TableRow
                          key={student._id || index}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {student.studentId}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {student.koreanFamily} {student.koreanGiven}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {student.englishFirst} {student.englishLast}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                student.status
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {student.status ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleView(student._id)}
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="View Student"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7.5a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleUpdate(student)}
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Edit Student"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 18 18"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                title="Delete Student"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H9V3ZM6 8C6 7.44772 6.44772 7 7 7H17C17.5523 7 18 7.44772 18 8V19C18 20.6569 16.6569 22 15 22H9C7.34315 22 6 20.6569 6 19V8ZM9 9C9.55228 9 10 9.44772 10 10V18C10 18.5523 9.55228 19 9 19C8.44772 19 8 18.5523 8 18V10C8 9.44772 8.44772 9 9 9ZM15 9C15.5523 9 16 9.44772 16 10V18C16 18.5523 15.5523 19 15 19C14.4477 19 14 18.5523 14 18V10C14 9.44772 14.4477 9 15 9Z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                className="border rounded px-2 py-1 min-w-[70px] dark:bg-gray-800 dark:text-white"
              >
                {[5, 10, 25].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
              >
                Prev
              </button>
              <span className="text-gray-600 dark:text-gray-300">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Update Modal */}
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          className="max-w-4xl mx-4"
        >
          <div className="relative w-full p-6 overflow-hidden bg-white rounded-xl shadow-2xl dark:bg-gray-800 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Student
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Update student details and information
                </p>
              </div>
              <button
                onClick={() => setIsUpdateOpen(false)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Scrollable Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Personal Information
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Student ID
                        </Label>
                        <Input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          placeholder="STU20250923001"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Gender
                        </Label>
                        <select
                          name="sex"
                          value={formData.sex}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          English First Name
                        </Label>
                        <Input
                          type="text"
                          name="englishFirst"
                          value={formData.englishFirst}
                          onChange={handleChange}
                          placeholder="John"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          English Last Name
                        </Label>
                        <Input
                          type="text"
                          name="englishLast"
                          value={formData.englishLast}
                          onChange={handleChange}
                          placeholder="Doe"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Korean Family Name
                        </Label>
                        <Input
                          type="text"
                          name="koreanFamily"
                          value={formData.koreanFamily}
                          onChange={handleChange}
                          placeholder="김"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Korean Given Name
                        </Label>
                        <Input
                          type="text"
                          name="koreanGiven"
                          value={formData.koreanGiven}
                          onChange={handleChange}
                          placeholder="철수"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date of Birth
                        </Label>
                        <Input
                          type="date"
                          name="birthday"
                          value={
                            formData.birthday
                              ? formData.birthday.split("T")[0]
                              : ""
                          }
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Grade
                        </Label>
                        <Input
                          type="text"
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          placeholder="5"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-lg dark:bg-green-900/30">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
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
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Contact Information
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Student Phone
                        </Label>
                        <Input
                          type="tel"
                          name="studentPhone"
                          value={formData.studentPhone}
                          onChange={handleChange}
                          placeholder="+82 10-1234-5678"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mother's Phone
                        </Label>
                        <Input
                          type="tel"
                          name="motherPhone"
                          value={formData.motherPhone}
                          onChange={handleChange}
                          placeholder="+82 10-9876-5432"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Father's Phone
                        </Label>
                        <Input
                          type="tel"
                          name="fatherPhone"
                          value={formData.fatherPhone}
                          onChange={handleChange}
                          placeholder="+82 10-5555-7777"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Student Email
                        </Label>
                        <Input
                          type="email"
                          name="studentEmail"
                          value={formData.studentEmail}
                          onChange={handleChange}
                          placeholder="student@example.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Parent Email
                        </Label>
                        <Input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          placeholder="parent@example.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Information Section */}
                  <div className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14v6l9-5M12 14v6l-9-5"
                          />
                        </svg>
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Enrollment Information
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date of Enrollment
                        </Label>
                        <Input
                          type="date"
                          name="dateOfEnrollment"
                          value={
                            formData.dateOfEnrollment
                              ? formData.dateOfEnrollment.split("T")[0]
                              : ""
                          }
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Class Reference
                        </Label>
                        <Input
                          type="text"
                          name="classRef"
                          value={formData.classRef}
                          onChange={handleChange}
                          placeholder="68d16818fefbeae4346fd5d3"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Days Preset
                        </Label>
                        <Input
                          type="text"
                          name="daysPreset"
                          value={formData.daysPreset}
                          onChange={handleChange}
                          placeholder="Mon–Fri"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attendance Days Section */}
                  <div className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
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
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Attendance Days
                      </h5>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7">
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
                          className="flex flex-col items-center p-3 transition-colors bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={formData.days?.[day.key] || false}
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
                  </div>

                  {/* Additional Information */}
                  <div className="p-6 bg-gray-50 rounded-xl dark:bg-gray-900/50">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </Label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="Allergic to peanuts. Needs special attention."
                        />
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Draft Status
                        </Label>
                        <select
                          name="draft"
                          value={formData.draft}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value={false}>Finalized</option>
                          <option value={true}>Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col gap-3 mt-8 sm:flex-row sm:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUpdateOpen(false)}
                  className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Deactivate Student"
          message={`Are you sure you want to deactivate student ${studentToDelete?.studentId}? This action cannot be undone.`}
        />
      </div>
    </div>
  );
}
