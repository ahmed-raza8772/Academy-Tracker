import Owner from "../../assets/images/user/user-01.jpg";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function UserMetaCard({ id }) {
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

        const response = await fetch(`${API_URL}/api/v1/student/`, {
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

  // Calculate age from birthday
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

  // Get status badge style
  const getStatusBadge = (status) => {
    return status
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src={Owner} alt="student" />
          </div>

          <div className="order-3 xl:order-2 flex-1">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {student.englishFirst} {student.englishLast}
              {student.koreanFamily && student.koreanGiven && (
                <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                  {student.koreanFamily} {student.koreanGiven}
                </span>
              )}
            </h4>

            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {student.studentId}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(student.status)}`}
              >
                {student.status ? "Active" : "Inactive"}
              </span>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Age: {calculateAge(student.birthday)}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.address?.city || "N/A"},{" "}
                {student.address?.country || "South Korea"}
              </p>
            </div>

            {/* Additional quick info */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 xl:justify-start">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Gender:{" "}
                {student.sex === "M"
                  ? "Male"
                  : student.sex === "F"
                    ? "Female"
                    : "N/A"}
              </span>
              <div className="h-3.5 w-px bg-gray-300 dark:bg-gray-700"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Transport:{" "}
                {student.transportType === "bus"
                  ? "Bus"
                  : student.transportType === "walk"
                    ? "Walk"
                    : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
