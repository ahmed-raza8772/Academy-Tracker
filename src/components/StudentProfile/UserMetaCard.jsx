import Owner from "../../assets/images/user/user-01.jpg";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function UserMetaCard({ id }) {
  // ✅ Fixed: destructure the prop
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

        // ✅ Fixed: Use the actual ID value
        const response = await fetch(`${API_URL}/api/v1/student/?id=${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch student");

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setStudent(data[0]);
        } else {
          throw new Error("Student not found");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      // ✅ Only fetch if id exists
      fetchStudent();
    } else {
      setLoading(false);
      setError("No student ID provided");
    }
  }, [id, token, API_URL]);

  // ✅ Added loading and error states
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
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {/* ✅ Safe access with optional chaining */}
              {student.koreanFamily} {student.koreanGiven}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.studentId}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Seoul, South Korea.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
