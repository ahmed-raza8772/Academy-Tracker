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

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // For update modal
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    status: true,
  });

  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/course/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setCourses(Array.isArray(data) ? data : []);
      console.log("Courses data:", data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [API_URL, token]);

  const handleView = (course) => {
    setSelectedCourse(course);
    setIsViewOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      status: course.status !== undefined ? course.status : true,
    });
    setIsUpdateOpen(true);
  };

  const handleDelete = (course) => {
    setCourseToDelete(course);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    if (!courseToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/course/${courseToDelete._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseCode: courseToDelete.courseCode,
            courseName: courseToDelete.courseName,
            status: false, // Soft delete
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update course status in the list
        setCourses((prev) =>
          prev.map((c) =>
            c._id === courseToDelete._id ? { ...c, status: false } : c
          )
        );

        setAlert({
          variant: "info",
          title: "Success",
          message: "Course has been deactivated successfully!",
        });
        setTimeout(() => setAlert(null), 3000);
        console.log("Course status updated:", data);
      } else {
        console.error("Failed to update status:", data);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed deactivating course!",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error deactivating course!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value === "true", // convert string to boolean
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedCourse = {
        courseCode: formData.courseCode.trim(),
        courseName: formData.courseName.trim(),
        status: formData.status, // boolean true/false
      };

      const response = await fetch(
        `${API_URL}/api/v1/course/${selectedCourse._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedCourse),
        }
      );

      if (!response.ok) throw new Error("Failed to update course");

      const data = await response.json();
      console.log("Updated course:", data);

      setCourses((prev) =>
        prev.map((course) =>
          course._id === selectedCourse._id
            ? { ...course, ...updatedCourse }
            : course
        )
      );

      setIsUpdateOpen(false);
      setAlert({
        variant: "success",
        title: "Success",
        message: "Course has been updated successfully!",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error("Error updating course:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error updating course!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle table row click
  const handleTableRowClick = (course) => {
    handleView(course);
  };

  // Prevent action buttons from triggering row click
  const handleActionClick = (e, action, course) => {
    e.stopPropagation();
    action(course);
  };

  // 🔍 Search - simplified for courses
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return courses;

    const term = searchTerm.toLowerCase().trim();
    return courses.filter((course) => {
      return (
        course.courseCode?.toLowerCase().includes(term) ||
        course.courseName?.toLowerCase().includes(term) ||
        (course.status ? "active" : "inactive").includes(term)
      );
    });
  }, [searchTerm, courses]);

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
        title="Manage Courses | AE EduTracks"
        description="Manage course information and course details from AE EduTracks portal"
      />
      <PageBreadcrumb pageTitle="Courses" />

      <div className="space-y-6">
        {/* Add Course Button */}
        <Link
          to="/Admin/Courses/Add"
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
          Add New Course
        </Link>
        <ComponentCard title="List of Courses">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
            <Input
              type="text"
              placeholder="Search by course code, name, or status..."
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
                        Course Code
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Course Name
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
                      paginatedData.map((course, index) => (
                        <TableRow
                          key={course._id || index}
                          onClick={() => handleTableRowClick(course)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {course.courseCode}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {course.courseName}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                course.status
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {course.status ? "Active" : "Inactive"}
                            </span>
                          </TableCell>

                          {/* Actions Column - View icon removed */}
                          <TableCell
                            className="px-4 py-3 text-start"
                            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking actions
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) =>
                                  handleActionClick(e, handleUpdate, course)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Edit Course"
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
                                  handleActionClick(e, handleDelete, course)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                title="Delete Course"
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
                          colSpan={4}
                          className="py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No courses found.
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
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Course
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update course details to keep your application up-to-date.
              </p>
            </div>
            <form className="flex flex-col">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="courseCode">Course Code</Label>
                    <Input
                      type="text"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleChange}
                      placeholder="Enter course code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleChange}
                      placeholder="Enter course name"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      options={statusOptions}
                      placeholder="Choose a status"
                      onChange={handleSelectChange}
                      defaultValue={formData.status ? "true" : "false"}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formData.status
                        ? "This course will be active and available for student enrollment"
                        : "This course will be inactive and not available for enrollment"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUpdateOpen(false)}
                >
                  Close
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Course Details
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Here are the details of the course.
              </p>
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Course Code</Label>
                  <Input
                    type="text"
                    value={selectedCourse?.courseCode || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Course Name</Label>
                  <Input
                    type="text"
                    value={selectedCourse?.courseName || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      selectedCourse?.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {selectedCourse?.status ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsViewOpen(false)}
              >
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
          title="Deactivate Course"
          message={`Are you sure you want to deactivate course ${courseToDelete?.courseCode}? This action cannot be undone.`}
        />
      </div>
    </div>
  );
}
