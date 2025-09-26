import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Loader from "../common/Loader";

export default function UserInfoCard({ id }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();

  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);

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

  // Handle save function for the modal
  const handleSave = () => {
    // Add your save logic here
    console.log("Saving changes...");
    closeModal();
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
                {student.koreanFamily} {student.koreanGiven}
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

            {/* Email */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Student Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.studentEmail || "N/A"}
              </p>
            </div>

            {/* Parent Email */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Parent Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {student.parentEmail || "N/A"}
              </p>
            </div>

            {/* Phone Numbers */}
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
                Grade
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Grade {student.grade || "N/A"}
              </p>
            </div>

            {/* Dates */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(student.birthday)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Enrollment
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(student.dateOfEnrollment)}
              </p>
            </div>

            {/* Notes */}
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

        {/* Edit Button */}
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update student details to keep the profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>English First Name</Label>
                    <Input type="text" defaultValue={student.englishFirst} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>English Last Name</Label>
                    <Input type="text" defaultValue={student.englishLast} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Korean Family Name</Label>
                    <Input type="text" defaultValue={student.koreanFamily} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Korean Given Name</Label>
                    <Input type="text" defaultValue={student.koreanGiven} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Student Email</Label>
                    <Input type="email" defaultValue={student.studentEmail} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Parent Email</Label>
                    <Input type="email" defaultValue={student.parentEmail} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Student Phone</Label>
                    <Input type="tel" defaultValue={student.studentPhone} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Mother's Phone</Label>
                    <Input type="tel" defaultValue={student.motherPhone} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Father's Phone</Label>
                    <Input type="tel" defaultValue={student.fatherPhone} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Grade</Label>
                    <Input type="text" defaultValue={student.grade} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      defaultValue={
                        student.birthday ? student.birthday.split("T")[0] : ""
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Input type="text" defaultValue={student.notes} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
