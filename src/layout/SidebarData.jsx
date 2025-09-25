import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

// ---------- ADMIN ----------
export const AdminSidebarData = [
  {
    name: "Dashboard",
    path: "/Admin/Dashboard",
    icon: <AiIcons.AiFillHome />,
  },
  {
    name: "Students",
    icon: <IoIcons.IoMdPeople />,
    subItems: [
      {
        name: "Add Student",
        path: "/blank",
        icon: <FaIcons.FaUserPlus />,
      },
      {
        name: "Manage Students",
        path: "/blank",
        icon: <FaIcons.FaUsersCog />,
      },
    ],
  },
  {
    name: "Teachers",
    icon: <FaIcons.FaChalkboardTeacher />,
    subItems: [
      {
        name: "Add Teacher",
        path: "/blank",
        icon: <FaIcons.FaUserPlus />,
      },
      {
        name: "Manage Teachers",
        path: "/blank",
        icon: <FaIcons.FaUsersCog />,
      },
    ],
  },
  {
    name: "Classes",
    icon: <FaIcons.FaSchool />,
    subItems: [
      {
        name: "Add Class",
        path: "/Admin/Classes/Add",
        icon: <FaIcons.FaPlusCircle />,
      },
      {
        name: "Manage Classes",
        path: "/Admin/Classes/Manage",
        icon: <FaIcons.FaListAlt />,
      },
    ],
  },
];

// ---------- STUDENT ----------
export const StudentSidebarData = [
  {
    name: "Dashboard",
    path: "/Student/Dashboard",
    icon: <AiIcons.AiFillHome />,
  },
  {
    name: "My Courses",
    path: "/Student/MyCourses",
    icon: <FaIcons.FaBook />,
  },
  {
    name: "Assignments",
    path: "/Student/Assignments",
    icon: <FaIcons.FaTasks />,
  },
  {
    name: "Messages",
    path: "/Student/Messages",
    icon: <FaIcons.FaEnvelope />,
  },
];

// ---------- TEACHER ----------
export const TeacherSidebarData = [
  {
    name: "Dashboard",
    path: "/Teacher/Dashboard",
    icon: <AiIcons.AiFillHome />,
  },
  {
    name: "My Classes",
    path: "/Teacher/MyClasses",
    icon: <FaIcons.FaChalkboardTeacher />,
  },
  {
    name: "Assignments",
    path: "/Teacher/Assignments",
    icon: <FaIcons.FaTasks />,
  },
  {
    name: "Reports",
    path: "/Teacher/Reports",
    icon: <FaIcons.FaChartBar />,
  },
];

// ---------- PARENT ----------
export const ParentSidebarData = [
  {
    name: "Dashboard",
    path: "/Parents/Dashboard",
    icon: <AiIcons.AiFillHome />,
  },
  {
    name: "Children Progress",
    path: "/Parents/ChildrenProgress",
    icon: <FaIcons.FaUserGraduate />,
  },
  {
    name: "Messages",
    path: "/Parents/Messages",
    icon: <FaIcons.FaEnvelope />,
  },
  {
    name: "Reports",
    path: "/Parents/Reports",
    icon: <FaIcons.FaChartBar />,
  },
];
