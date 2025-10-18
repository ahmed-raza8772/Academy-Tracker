import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import UserMetaCard from "../../../components/StudentProfile/UserMetaCard";
import UserInfoCard from "../../../components/StudentProfile/UserInfoCard";
import UserAddressCard from "../../../components/StudentProfile/UserAddressCard";
import { ChevronLeftIcon } from "../../../icons";
import { Link } from "react-router";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../hooks/useAuth";
import ExternalLoginCredentials from "../../../components/StudentProfile/ExternalLoginCredentials";
import Footer from "../../../components/footer/Footer";

export default function ViewStudent() {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/student/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const student = await response.json();
          setStudentData(student);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id, token, API_URL]);

  const downloadStudentBiography = async () => {
    try {
      setDownloading(true);

      // Fetch specific student data by ID
      const studentResponse = await fetch(`${API_URL}/api/v1/student/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!studentResponse.ok) throw new Error("Failed to fetch student data");

      const student = await studentResponse.json();

      if (!student) throw new Error("Student not found");

      // Fetch additional data using specific endpoints
      const fetchPromises = [];

      // Fetch classes data for the student
      if (student.classRef && student.classRef.length > 0) {
        const classPromises = student.classRef.map((classId) =>
          fetch(`${API_URL}/api/v1/class/${classId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        );
        fetchPromises.push(Promise.all(classPromises));
      } else {
        fetchPromises.push(Promise.resolve([]));
      }

      // Fetch courses data for the student
      if (student.courses && student.courses.length > 0) {
        const coursePromises = student.courses.map((courseId) =>
          fetch(`${API_URL}/api/v1/course/${courseId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        );
        fetchPromises.push(Promise.all(coursePromises));
      } else {
        fetchPromises.push(Promise.resolve([]));
      }

      // Fetch bus data if available
      if (student.bus) {
        fetchPromises.push(
          fetch(`${API_URL}/api/v1/bus/${student.bus}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        );
      } else {
        fetchPromises.push(Promise.resolve(null));
      }

      // School data (currently hardcoded, but you can replace with API call)
      fetchPromises.push(
        Promise.resolve([
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
        ])
      );

      const [classesData, coursesData, studentBus, schoolsData] =
        await Promise.all(fetchPromises);

      // Process data
      const studentClasses = Array.isArray(classesData)
        ? classesData.filter((cls) => cls !== null)
        : [];
      const studentCourses = Array.isArray(coursesData)
        ? coursesData.filter((course) => course !== null)
        : [];

      const studentSchool =
        Array.isArray(schoolsData) && student.school
          ? schoolsData.find(
              (school) => String(school._id) === String(student.school)
            )
          : null;

      // Generate professional biography HTML
      const biographyHTML = generateBiographyHTML(
        student,
        studentClasses,
        studentCourses,
        studentBus,
        studentSchool
      );

      // Create and print the biography
      const printWindow = window.open("", "_blank");
      printWindow.document.write(biographyHTML);
      printWindow.document.close();

      // Wait for images to load before printing
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    } catch (error) {
      console.error("Error generating biography:", error);
      alert("Failed to generate biography. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const generateBiographyHTML = (student, classes, courses, bus, school) => {
    const fullName =
      `${student.englishFirst || ""} ${student.englishLast || ""}`.trim();
    const koreanName =
      `${student.koreanFamily || ""} ${student.koreanGiven || ""}`.trim();
    const age = student.birthday ? calculateAge(student.birthday) : "N/A";
    const enrollmentDate = student.dateOfEnrollment
      ? new Date(student.dateOfEnrollment).toLocaleDateString()
      : "N/A";
    const birthDate = student.birthday
      ? new Date(student.birthday).toLocaleDateString()
      : "N/A";
    const createdDate = student.createdAt
      ? new Date(student.createdAt).toLocaleDateString()
      : "N/A";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Biography - ${fullName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            padding: 0;
            margin: 0;
        }

        .a4-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }

        .school-name {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
        }

        .document-title {
            font-size: 18px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 16px;
        }

        .student-name {
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }

        .student-id {
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
        }

        .korean-name {
            font-size: 18px;
            color: #4b5563;
            margin-bottom: 16px;
        }

        .section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-title::before {
            content: "■";
            color: #3b82f6;
            font-size: 16px;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
        }

        .info-group {
            margin-bottom: 16px;
        }

        .info-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 500;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: ${student.status ? "#dcfce7" : "#fef2f2"};
            color: ${student.status ? "#166534" : "#991b1b"};
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .academic-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .academic-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }

        .academic-details {
            font-size: 12px;
            color: #6b7280;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
        }

        .full-address {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            grid-column: 1 / -1;
        }

        .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }

        .qr-code {
            width: 80px;
            height: 80px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            margin: 16px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #9ca3af;
        }

        @media print {
            body { margin: 0; padding: 0; }
            .a4-container {
                width: 100%;
                height: 100%;
                padding: 15mm;
                box-shadow: none;
                margin: 0;
            }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="a4-container">
        <!-- Header Section -->
        <div class="header">
            <div class="school-name">AE EduTracks Academy</div>
            <div class="document-title">STUDENT BIOGRAPHY & PROFILE</div>
            <div class="student-name">${fullName || "Student Name"}</div>
            ${koreanName ? `<div class="korean-name">${koreanName}</div>` : ""}
            <div class="student-id">Student ID: ${student.studentId || "N/A"} | Status: <span class="status-badge">${student.status ? "ACTIVE" : "INACTIVE"}</span></div>
        </div>

        <!-- Personal Information -->
        <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="grid-3">
                <div class="info-group">
                    <div class="info-label">Date of Birth</div>
                    <div class="info-value">${birthDate}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Age</div>
                    <div class="info-value">${age} years</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Gender</div>
                    <div class="info-value">${student.sex === "M" ? "Male" : student.sex === "F" ? "Female" : "N/A"}</div>
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="contact-grid">
                <div class="info-group">
                    <div class="info-label">Student Phone</div>
                    <div class="info-value">${student.studentPhone || "N/A"}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Student Email</div>
                    <div class="info-value">${student.studentEmail || "N/A"}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Mother's Phone</div>
                    <div class="info-value">${student.motherPhone || "N/A"}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Father's Phone</div>
                    <div class="info-value">${student.fatherPhone || "N/A"}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Parent Email</div>
                    <div class="info-value">${student.parentEmail || "N/A"}</div>
                </div>
                <div class="full-address">
                    <div class="info-label">Full Address</div>
                    <div class="info-value">
                        ${
                          student.address
                            ? `${student.address.street || ""}, ${student.address.city || ""}, ${student.address.state || ""} ${student.address.postalCode || ""}, ${student.address.country || "South Korea"}`
                                .replace(/, ,/g, ",")
                                .replace(/\s+/g, " ")
                                .trim()
                            : "N/A"
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- Academic Information -->
        <div class="section">
            <div class="section-title">Academic Information</div>
            <div class="grid-2">
                <div>
                    <div class="info-label">School</div>
                    <div class="info-value" style="margin-bottom: 16px;">${school?.schoolName || "N/A"}</div>

                    <div class="info-label">Date of Enrollment</div>
                    <div class="info-value">${enrollmentDate}</div>
                </div>
                <div>
                    <div class="info-label">Transportation</div>
                    <div class="info-value" style="margin-bottom: 8px;">
                        ${student.transportType === "bus" ? "School Bus" : student.transportType === "walk" ? "Walk to School" : "N/A"}
                    </div>
                    ${
                      bus
                        ? `
                    <div class="info-label">Bus Details</div>
                    <div class="info-value">${bus.busName || "Bus"} ${bus.busNumber ? `#${bus.busNumber}` : ""} ${bus.route ? `(${bus.route})` : ""}</div>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>

        <!-- Classes & Courses -->
        <div class="section">
            <div class="section-title">Classes & Courses</div>
            <div class="grid-2">
                <div>
                    <div class="info-label" style="margin-bottom: 12px;">Assigned Classes (${classes.length})</div>
                    ${
                      classes.length > 0
                        ? classes
                            .map(
                              (cls) => `
                        <div class="academic-item" style="margin-bottom: 8px;">
                            <div class="academic-title">${cls.className || "Unnamed Class"}</div>
                            ${cls.gradeLevel ? `<div class="academic-details">Grade ${cls.gradeLevel} ${cls.section ? `• Section ${cls.section}` : ""}</div>` : ""}
                        </div>
                    `
                            )
                            .join("")
                        : '<div class="info-value">No classes assigned</div>'
                    }
                </div>
                <div>
                    <div class="info-label" style="margin-bottom: 12px;">Enrolled Courses (${courses.length})</div>
                    ${
                      courses.length > 0
                        ? courses
                            .map(
                              (course) => `
                        <div class="academic-item" style="margin-bottom: 8px;">
                            <div class="academic-title">${course.courseName || "Unnamed Course"}</div>
                            ${course.courseCode ? `<div class="academic-details">Code: ${course.courseCode} ${course.credits ? `• ${course.credits} credits` : ""}</div>` : ""}
                        </div>
                    `
                            )
                            .join("")
                        : '<div class="info-value">No courses enrolled</div>'
                    }
                </div>
            </div>
        </div>

        <!-- Additional Information -->
        <div class="section">
            <div class="section-title">Additional Information</div>
            <div class="grid-3">
                <div class="info-group">
                    <div class="info-label">Attendance Days</div>
                    <div class="info-value">${formatAttendanceDays(student.days)}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Days Preset</div>
                    <div class="info-value">${student.daysPreset || "Custom Schedule"}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Profile Created</div>
                    <div class="info-value">${createdDate}</div>
                </div>
            </div>
            ${
              student.notes
                ? `
            <div class="info-group" style="margin-top: 16px;">
                <div class="info-label">Additional Notes</div>
                <div class="info-value">${student.notes}</div>
            </div>
            `
                : ""
            }
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="qr-code">QR Code<br>Placeholder</div>
            <div>Generated by AE EduTracks Student Management System</div>
            <div>Document generated on ${new Date().toLocaleDateString()} • Confidential Student Information</div>
        </div>
    </div>
</body>
</html>
    `;
  };

  // Helper functions
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

  const formatAttendanceDays = (days) => {
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
      .filter(([, isSelected]) => isSelected)
      .map(([day]) => dayMap[day] || day)
      .join(", ");
    return selectedDays || "No days selected";
  };

  // Get student email for credentials activation
  const getStudentEmail = () => {
    return studentData?.studentEmail || studentData?.parentEmail || "";
  };

  return (
    <div>
      <PageMeta
        title="Student Profile | AE EduTracks"
        description="View and manage student profile information"
      />
      <PageBreadcrumb pageTitle="Student Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => window.history.back()}
            >
              <ChevronLeftIcon className="size-5" />
              Back
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Activate Credentials Button */}
            {getStudentEmail() && (
              <Link
                to={`/Admin/Users/Add?email=${encodeURIComponent(getStudentEmail())}&username=${encodeURIComponent(getStudentEmail())}&role=student`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Activate Credentials
              </Link>
            )}

            {/* Download Button */}
            <button
              onClick={downloadStudentBiography}
              disabled={downloading}
              className="inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Download student details"
            >
              {downloading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <UserMetaCard id={id} />
          <UserInfoCard id={id} />
          <ExternalLoginCredentials studentId={id} />
          <UserAddressCard id={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
