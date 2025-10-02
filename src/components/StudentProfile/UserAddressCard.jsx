import { useEffect, useState } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function UserAddressCard({ id }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busDetails, setBusDetails] = useState(null);
  const [busLoading, setBusLoading] = useState(false);
  const [classDetails, setClassDetails] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        setStudent(null);
        setBusDetails(null);
        setClassDetails([]);
        setCourseDetails([]);

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

            // If student has bus reference and transport type is bus, fetch bus details
            if (found.bus && found.transportType === "bus") {
              await fetchBusDetails(found.bus);
            }

            // Fetch class and course details
            if (found.classRef && found.classRef.length > 0) {
              await fetchClassDetails(found.classRef);
            }
            if (found.courses && found.courses.length > 0) {
              await fetchCourseDetails(found.courses);
            }
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

    const fetchBusDetails = async (busId) => {
      try {
        setBusLoading(true);

        // Fetch all buses
        const busResponse = await fetch(`${API_URL}/api/v1/bus/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!busResponse.ok) throw new Error("Failed to fetch buses");

        const busesData = await busResponse.json();

        // Filter to find the specific bus by ID
        if (Array.isArray(busesData)) {
          const foundBus = busesData.find(
            (bus) => String(bus._id) === String(busId)
          );
          if (foundBus) {
            setBusDetails(foundBus);
          } else {
            console.warn(`Bus with ID ${busId} not found`);
          }
        } else {
          console.warn("Unexpected buses data format:", busesData);
        }
      } catch (error) {
        console.error("Error fetching bus details:", error);
      } finally {
        setBusLoading(false);
      }
    };

    const fetchClassDetails = async (classIds) => {
      try {
        setClassesLoading(true);

        // Fetch all classes
        const classResponse = await fetch(`${API_URL}/api/v1/class/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!classResponse.ok) throw new Error("Failed to fetch classes");

        const classesData = await classResponse.json();

        // Filter to find the specific classes by IDs
        if (Array.isArray(classesData)) {
          const foundClasses = classesData.filter((cls) =>
            classIds.includes(String(cls._id))
          );
          setClassDetails(foundClasses);
        } else {
          console.warn("Unexpected classes data format:", classesData);
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
      } finally {
        setClassesLoading(false);
      }
    };

    const fetchCourseDetails = async (courseIds) => {
      try {
        setCoursesLoading(true);

        // Fetch all courses
        const courseResponse = await fetch(`${API_URL}/api/v1/course/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!courseResponse.ok) throw new Error("Failed to fetch courses");

        const coursesData = await courseResponse.json();

        // Filter to find the specific courses by IDs
        if (Array.isArray(coursesData)) {
          const foundCourses = coursesData.filter((course) =>
            courseIds.includes(String(course._id))
          );
          setCourseDetails(foundCourses);
        } else {
          console.warn("Unexpected courses data format:", coursesData);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    } else {
      setLoading(false);
      setError("No student ID provided");
    }
  }, [id, token, API_URL]);

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Display attendance days
  const getAttendanceDays = (days) => {
    if (!days) return "N/A";

    const dayMap = {
      M: "Mon",
      T: "Tue",
      W: "Wed",
      Th: "Thu",
      F: "Fri",
      Sat: "Sat",
      Sun: "Sun",
    };

    const selectedDays = Object.entries(days)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => dayMap[day] || day)
      .join(", ");

    return selectedDays || "No days selected";
  };

  // Bus Icon Component
  const BusIcon = ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  // Transport Icons
  const TransportIcon = ({ type, className = "w-4 h-4" }) => {
    if (type === "bus") {
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    );
  };

  // Loading state
  if (loading) return <Loader />;

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
            Address & Administrative Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {/* Address Information */}
            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.street || "N/A"},{" "}
                {student.address?.city || "N/A"},{" "}
                {student.address?.state || "N/A"}{" "}
                {student.address?.postalCode || ""}{" "}
                {student.address?.country ? `, ${student.address.country}` : ""}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Street
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.street || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                City
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.city || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                State/Province
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.state || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Postal Code
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.postalCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.address?.country || "South Korea"}
              </p>
            </div>

            {/* Transport Information Section */}
            <div className="lg:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  <TransportIcon
                    type={student.transportType}
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Transportation Details
                </h5>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Transport Type
                  </p>
                  <div className="flex items-center gap-2">
                    <TransportIcon
                      type={student.transportType}
                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {student.transportType === "bus"
                        ? "School Bus"
                        : student.transportType === "walk"
                          ? "Walk to School"
                          : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Bus Information */}
                {student.transportType === "bus" && (
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Assigned Bus
                    </p>
                    <div className="flex items-center gap-2">
                      <BusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      {busLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Loading bus details...
                          </span>
                        </div>
                      ) : busDetails ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {busDetails.busName || "School Bus"}
                            {busDetails.busNumber && (
                              <span className="text-blue-600 dark:text-blue-400 ml-1">
                                #{busDetails.busNumber}
                              </span>
                            )}
                          </span>
                          {busDetails.route && (
                            <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                              {busDetails.route}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {student.bus
                            ? "Details unavailable"
                            : "No bus assigned"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="lg:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
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
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                  </svg>
                </div>
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Academic Information
                </h5>
              </div>

              <div className="space-y-6">
                {/* Classes Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Assigned Classes
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {student.classRef?.length || 0} classes
                    </span>
                  </div>

                  {classesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Loading classes...
                      </span>
                    </div>
                  ) : classDetails.length > 0 ? (
                    <div className="space-y-2">
                      {classDetails.map((classItem) => (
                        <div
                          key={classItem._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                              <svg
                                className="w-3 h-3 text-orange-600 dark:text-orange-400"
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
                              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {classItem.className || "Unnamed Class"}
                              </p>
                              {classItem.gradeLevel && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Grade {classItem.gradeLevel}
                                </p>
                              )}
                            </div>
                          </div>
                          {classItem.section && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                              {classItem.section}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 rounded-lg dark:bg-gray-800/50">
                      No classes assigned
                    </div>
                  )}
                </div>

                {/* Courses Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Enrolled Courses
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {student.courses?.length || 0} courses
                    </span>
                  </div>

                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Loading courses...
                      </span>
                    </div>
                  ) : courseDetails.length > 0 ? (
                    <div className="space-y-2">
                      {courseDetails.map((course) => (
                        <div
                          key={course._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                              <svg
                                className="w-3 h-3 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {course.courseName || "Unnamed Course"}
                              </p>
                              {course.courseCode && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Code: {course.courseCode}
                                </p>
                              )}
                            </div>
                          </div>
                          {course.credits && (
                            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                              {course.credits} credits
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 rounded-lg dark:bg-gray-800/50">
                      No courses enrolled
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Information */}
            <div className="lg:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Attendance Schedule
                </h5>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Days Preset
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {student.daysPreset || "Custom Schedule"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Attendance Days
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {getAttendanceDays(student.days)}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="lg:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  System Information
                </h5>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Created Date
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDateTime(student.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDateTime(student.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
