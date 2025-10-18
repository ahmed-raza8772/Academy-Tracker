import React, { useState, useMemo, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Input from "../../../components/form/input/InputField";
import Loader from "../../../components/common/Loader";
import { Link } from "react-router";

import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import Select from "../../../components/form/Select";
import ConfirmationModal from "../../../components/form/ConfirmationModal";
import { useAuthStore } from "../../../hooks/useAuth";
import Footer from "../../../components/footer/Footer";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // For update modal
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    teacherType: "",
  });

  const teacherTypeOptions = [
    { value: "Home", label: "Home Teacher" },
    { value: "Native", label: "Native Teacher" },
    { value: "PartTime", label: "Part Time Teacher" },
  ];

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/createUser/getAll`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // Filter users where role = "teacher"
      const teachersData = Array.isArray(data)
        ? data.filter((user) => user.role === "teacher")
        : [];

      setTeachers(teachersData);
      console.log("Teachers data:", teachersData);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Failed to load teachers",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [API_URL, token]);

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      fullname: teacher.fullname || "",
      email: teacher.email || "",
      teacherType: teacher.teacherType || "",
    });
    setIsUpdateOpen(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    if (!teacherToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/createUser/${teacherToDelete._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullname: teacherToDelete.fullname,
            email: teacherToDelete.email,
            teacherType: teacherToDelete.teacherType,
            status: false, // Soft delete
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update teacher status in the list
        setTeachers((prev) =>
          prev.map((t) => (t._id === teacherToDelete._id ? { ...t } : t))
        );

        setAlert({
          variant: "info",
          title: "Success",
          message: "Teacher has been deactivated successfully!",
        });
        setTimeout(() => setAlert(null), 3000);
        console.log("Teacher status updated:", data);
      } else {
        console.error("Failed to update status:", data);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed deactivating teacher!",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error deactivating teacher!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleTeacherTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      teacherType: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedTeacher = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        teacherType: formData.teacherType,
      };

      const response = await fetch(
        `${API_URL}/api/v1/createUser/${selectedTeacher._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTeacher),
        }
      );

      if (!response.ok) throw new Error("Failed to update teacher");

      const data = await response.json();
      console.log("Updated teacher:", data);

      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher._id === selectedTeacher._id
            ? { ...teacher, ...updatedTeacher }
            : teacher
        )
      );

      setIsUpdateOpen(false);
      setAlert({
        variant: "success",
        title: "Success",
        message: "Teacher has been updated successfully!",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error("Error updating teacher:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error updating teacher!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle table row click
  const handleTableRowClick = (teacher) => {
    handleView(teacher);
  };

  // Prevent action buttons from triggering row click
  const handleActionClick = (e, action, teacher) => {
    e.stopPropagation();
    action(teacher);
  };

  // 🔍 Search - enhanced for teachers
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return teachers;

    const term = searchTerm.toLowerCase().trim();
    return teachers.filter((teacher) => {
      return (
        teacher.fullname?.toLowerCase().includes(term) ||
        teacher.email?.toLowerCase().includes(term) ||
        teacher.teacherType?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, teachers]);

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
        title="Manage Teachers | AE EduTracks"
        description="Manage teacher information and details from AE EduTracks portal"
      />
      <PageBreadcrumb pageTitle="Teachers" />

      <div className="space-y-6">
        {/* Add Teacher Button */}
        <Link
          to="/Admin/Users/Add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 dark:focus:ring-offset-gray-900"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Teacher
        </Link>
        <ComponentCard title="List of Teachers">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
            <Input
              type="text"
              placeholder="Search by name, email, or teacher type..."
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
              <div className="min-w-fit">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider sm:px-6"
                      >
                        Full Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Teacher Type
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
                      paginatedData.map((teacher, index) => (
                        <TableRow
                          key={teacher._id || index}
                          onClick={() => handleTableRowClick(teacher)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {teacher.fullname}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {teacher.email}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                teacher.teacherType === "Home"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : teacher.teacherType === "Native"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              }`}
                            >
                              {teacher.teacherType || "Not Specified"}
                            </span>
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell
                            className="px-4 py-3 text-start"
                            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking actions
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) =>
                                  handleActionClick(e, handleUpdate, teacher)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Edit Teacher"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 18 18"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                    fill=""
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) =>
                                  handleActionClick(e, handleDelete, teacher)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                title="Delete Teacher"
                              >
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
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
                          No teachers found.
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
          className="max-w-2xl"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Edit Teacher Details
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update teacher information and details
                </p>
              </div>
              <button
                onClick={() => setIsUpdateOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <form className="space-y-6">
                {/* Teacher Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Teacher Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullname" className="mb-2">
                        Full Name
                      </Label>
                      <Input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2">
                        Email
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherType" className="mb-2">
                        Teacher Type
                      </Label>
                      <Select
                        options={teacherTypeOptions}
                        placeholder="Choose teacher type"
                        onChange={handleTeacherTypeChange}
                        defaultValue={formData.teacherType}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setIsUpdateOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          className="max-w-2xl"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Teacher Details
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Complete information about the selected teacher
                </p>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Teacher Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Teacher Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2">Full Name</Label>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                        {selectedTeacher?.fullname || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2">Email</Label>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                        {selectedTeacher?.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2">Teacher Type</Label>
                      <div className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedTeacher?.teacherType === "Home"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : selectedTeacher?.teacherType === "Native"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {selectedTeacher?.teacherType || "Not Specified"}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="mb-2">Role</Label>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                        {selectedTeacher?.role || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Deactivate Teacher"
          message={`Are you sure you want to deactivate teacher "${teacherToDelete?.fullname}"? This action will make the teacher unavailable for teaching assignments.`}
          confirmText="Deactivate"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
      <Footer />
    </div>
  );
}
