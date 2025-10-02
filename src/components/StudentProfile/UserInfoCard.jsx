import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";

import Loader from "../common/Loader";

export default function UserInfoCard({ id }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        setStudent(null);

        const response = await fetch(`${API_URL}/api/v1/student`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const found = data.find((s) => String(s._id) === String(id));
          if (found) {
            setStudent(found);
          } else {
            throw new Error("Student not found");
          }
        } else {
          throw new Error("No students returned");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    } else {
      setLoading(false);
      setError("No student ID provided");
    }
  }, [id, token, API_URL]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate age
  const calculateAge = (birthday) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  // No student data state
  if (!student) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-center">
          <div className="text-gray-500">No student data found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {/* English Name */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                English First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.englishFirst || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                English Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.englishLast || "N/A"}
              </p>
            </div>

            {/* Korean Name */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Korean Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.koreanFamily || "N/A"} {student.koreanGiven || ""}
              </p>
            </div>

            {/* Student ID */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Student ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.studentId || "N/A"}
              </p>
            </div>

            {/* Personal Details */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.sex === "M"
                  ? "Male"
                  : student.sex === "F"
                    ? "Female"
                    : "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(student.birthday)} ({calculateAge(student.birthday)}{" "}
                years old)
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Student Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.studentPhone || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Student Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.studentEmail || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Mother's Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.motherPhone || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Father's Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.fatherPhone || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Parent Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.parentEmail || "N/A"}
              </p>
            </div>

            {/* Enrollment Information */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Enrollment
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(student.dateOfEnrollment)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    student.status
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {student.status ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            {/* Additional Information */}
            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Notes
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.notes || "No notes available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
