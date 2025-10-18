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

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [selectedBus, setSelectedBus] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);

  // For update modal
  const [formData, setFormData] = useState({
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

  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/bus/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setBuses(Array.isArray(data) ? data : []);
      console.log("Buses data:", data);
    } catch (error) {
      console.error("Error fetching buses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [API_URL, token]);

  const handleView = (bus) => {
    setSelectedBus(bus);
    setIsViewOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busName: bus.busName || "",
      busNumber: bus.busNumber || "",
      status: bus.status !== undefined ? bus.status : true,
      driverName: bus.driverName || "",
      driverAge: bus.driverAge || "",
      driverArcNumber: bus.driverArcNumber || "",
      driverLicenceNumber: bus.driverLicenceNumber || "",
      helperName: bus.helperName || "",
      helperNumber: bus.helperNumber || "",
      helperAge: bus.helperAge || "",
      helperArcNumber: bus.helperArcNumber || "",
    });
    setIsUpdateOpen(true);
  };

  const handleDelete = (bus) => {
    setBusToDelete(bus);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    if (!busToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/bus/${busToDelete._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busName: busToDelete.busName,
          busNumber: busToDelete.busNumber,
          status: false, // Soft delete
          driverName: busToDelete.driverName,
          driverAge: busToDelete.driverAge,
          driverArcNumber: busToDelete.driverArcNumber,
          driverLicenceNumber: busToDelete.driverLicenceNumber,
          helperName: busToDelete.helperName,
          helperNumber: busToDelete.helperNumber,
          helperAge: busToDelete.helperAge,
          helperArcNumber: busToDelete.helperArcNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update bus status in the list
        setBuses((prev) =>
          prev.map((b) =>
            b._id === busToDelete._id ? { ...b, status: false } : b
          )
        );

        setAlert({
          variant: "info",
          title: "Success",
          message: "Bus has been deactivated successfully!",
        });
        setTimeout(() => setAlert(null), 3000);
        console.log("Bus status updated:", data);
      } else {
        console.error("Failed to update status:", data);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed deactivating bus!",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error deactivating bus!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setBusToDelete(null);
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
      const updatedBus = {
        busName: formData.busName.trim(),
        busNumber: formData.busNumber.trim(),
        status: formData.status, // boolean true/false
        driverName: formData.driverName.trim(),
        driverAge: formData.driverAge.trim(),
        driverArcNumber: formData.driverArcNumber.trim(),
        driverLicenceNumber: formData.driverLicenceNumber.trim(),
        helperName: formData.helperName.trim(),
        helperNumber: formData.helperNumber.trim(),
        helperAge: formData.helperAge.trim(),
        helperArcNumber: formData.helperArcNumber.trim(),
      };

      const response = await fetch(`${API_URL}/api/v1/bus/${selectedBus._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBus),
      });

      if (!response.ok) throw new Error("Failed to update bus");

      const data = await response.json();
      console.log("Updated bus:", data);

      setBuses((prev) =>
        prev.map((bus) =>
          bus._id === selectedBus._id ? { ...bus, ...updatedBus } : bus
        )
      );

      setIsUpdateOpen(false);
      setAlert({
        variant: "success",
        title: "Success",
        message: "Bus has been updated successfully!",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error("Error updating bus:", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Error updating bus!",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle table row click
  const handleTableRowClick = (bus) => {
    handleView(bus);
  };

  // Prevent action buttons from triggering row click
  const handleActionClick = (e, action, bus) => {
    e.stopPropagation();
    action(bus);
  };

  // 🔍 Search - enhanced for buses with driver/helper fields
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return buses;

    const term = searchTerm.toLowerCase().trim();
    return buses.filter((bus) => {
      return (
        bus.busName?.toLowerCase().includes(term) ||
        bus.busNumber?.toLowerCase().includes(term) ||
        bus.driverName?.toLowerCase().includes(term) ||
        bus.helperName?.toLowerCase().includes(term) ||
        bus.driverArcNumber?.toLowerCase().includes(term) ||
        bus.helperArcNumber?.toLowerCase().includes(term) ||
        (bus.status ? "active" : "inactive").includes(term)
      );
    });
  }, [searchTerm, buses]);

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
        title="Manage Buses | AE EduTracks"
        description="Manage bus information and transportation details from AE EduTracks portal"
      />
      <PageBreadcrumb pageTitle="Buses" />

      <div className="space-y-6">
        {/* Add Bus Button */}
        <Link
          to="/Admin/Buses/Add"
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
          Add New Bus
        </Link>
        <ComponentCard title="List of Buses">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
            <Input
              type="text"
              placeholder="Search by bus name, number, driver, helper, or status..."
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
                        Bus Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Bus Number
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Driver
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-700 text-start text-theme-xs dark:text-gray-200 uppercase tracking-wider"
                      >
                        Helper
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
                      paginatedData.map((bus, index) => (
                        <TableRow
                          key={bus._id || index}
                          onClick={() => handleTableRowClick(bus)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {bus.busName}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {bus.busNumber}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {bus.driverName || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {bus.helperName || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                bus.status
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {bus.status ? "Active" : "Inactive"}
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
                                  handleActionClick(e, handleUpdate, bus)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Edit Bus"
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
                                  handleActionClick(e, handleDelete, bus)
                                }
                                className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                title="Delete Bus"
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
                          colSpan={6}
                          className="py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No buses found.
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
          className="max-w-4xl"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Edit Bus Details
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update bus information and personnel details
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
                {/* Basic Bus Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Basic Bus Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="busName" className="mb-2">
                        Bus Name
                      </Label>
                      <Input
                        type="text"
                        name="busName"
                        value={formData.busName}
                        onChange={handleChange}
                        placeholder="Enter bus name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="busNumber" className="mb-2">
                        Bus Number
                      </Label>
                      <Input
                        type="text"
                        name="busNumber"
                        value={formData.busNumber}
                        onChange={handleChange}
                        placeholder="Enter bus number"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="status" className="mb-2">
                        Status
                      </Label>
                      <Select
                        options={statusOptions}
                        placeholder="Choose a status"
                        onChange={handleSelectChange}
                        defaultValue={formData.status ? "true" : "false"}
                        className="w-full"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {formData.status
                          ? "This bus will be active and available for student transportation"
                          : "This bus will be inactive and not available for transportation"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Driver Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="driverName" className="mb-2">
                        Driver Name
                      </Label>
                      <Input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        placeholder="Enter driver name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverAge" className="mb-2">
                        Driver Age
                      </Label>
                      <Input
                        type="text"
                        name="driverAge"
                        value={formData.driverAge}
                        onChange={handleChange}
                        placeholder="Enter driver age"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverArcNumber" className="mb-2">
                        Driver ARC Number
                      </Label>
                      <Input
                        type="text"
                        name="driverArcNumber"
                        value={formData.driverArcNumber}
                        onChange={handleChange}
                        placeholder="Enter ARC number"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverLicenceNumber" className="mb-2">
                        Driver Licence Number
                      </Label>
                      <Input
                        type="text"
                        name="driverLicenceNumber"
                        value={formData.driverLicenceNumber}
                        onChange={handleChange}
                        placeholder="Enter licence number"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Helper Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Helper Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="helperName" className="mb-2">
                        Helper Name
                      </Label>
                      <Input
                        type="text"
                        name="helperName"
                        value={formData.helperName}
                        onChange={handleChange}
                        placeholder="Enter helper name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="helperNumber" className="mb-2">
                        Helper Number
                      </Label>
                      <Input
                        type="text"
                        name="helperNumber"
                        value={formData.helperNumber}
                        onChange={handleChange}
                        placeholder="Enter contact number"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="helperAge" className="mb-2">
                        Helper Age
                      </Label>
                      <Input
                        type="text"
                        name="helperAge"
                        value={formData.helperAge}
                        onChange={handleChange}
                        placeholder="Enter helper age"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="helperArcNumber" className="mb-2">
                        Helper ARC Number
                      </Label>
                      <Input
                        type="text"
                        name="helperArcNumber"
                        value={formData.helperArcNumber}
                        onChange={handleChange}
                        placeholder="Enter ARC number"
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
          className="max-w-4xl"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Bus Details
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Complete information about the selected bus
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
                {/* Basic Bus Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Basic Bus Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2">Bus Name</Label>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                        {selectedBus?.busName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2">Bus Number</Label>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                        {selectedBus?.busNumber || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2">Status</Label>
                      <div className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBus?.status
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {selectedBus?.status ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Driver Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Driver Name", value: selectedBus?.driverName },
                      { label: "Driver Age", value: selectedBus?.driverAge },
                      {
                        label: "Driver ARC Number",
                        value: selectedBus?.driverArcNumber,
                      },
                      {
                        label: "Driver Licence Number",
                        value: selectedBus?.driverLicenceNumber,
                      },
                    ].map((field, index) => (
                      <div key={index}>
                        <Label className="mb-2">{field.label}</Label>
                        <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                          {field.value || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helper Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Helper Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Helper Name", value: selectedBus?.helperName },
                      {
                        label: "Helper Number",
                        value: selectedBus?.helperNumber,
                      },
                      { label: "Helper Age", value: selectedBus?.helperAge },
                      {
                        label: "Helper ARC Number",
                        value: selectedBus?.helperArcNumber,
                      },
                    ].map((field, index) => (
                      <div key={index}>
                        <Label className="mb-2">{field.label}</Label>
                        <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-white">
                          {field.value || "N/A"}
                        </div>
                      </div>
                    ))}
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
          title="Deactivate Bus"
          message={`Are you sure you want to deactivate bus "${busToDelete?.busName}" (${busToDelete?.busNumber})? This action will make the bus unavailable for transportation.`}
          confirmText="Deactivate"
          cancelText="Cancel"
          variant="danger"
        />
      </div>

      <Footer />
    </div>
  );
}
