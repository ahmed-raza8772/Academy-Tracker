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
    name: "Users",
    icon: <FaIcons.FaUsers />, // Represents a group of people
    subItems: [
      {
        name: "Add User",
        path: "/Admin/Users/Add",
        icon: <FaIcons.FaUserPlus />, // Explicitly means "add a person"
      },
      {
        name: "Manage Users",
        path: "/Admin/Users/Manage",
        icon: <FaIcons.FaUserCog />, // Represents user settings/management
      },
    ],
  },
  {
    name: "Students",
    icon: <IoIcons.IoMdPeople />,
    subItems: [
      {
        name: "Add Student",
        path: "/Admin/Students/Add",
        icon: <FaIcons.FaUserPlus />,
      },
      {
        name: "Manage Students",
        path: "/Admin/Students/Manage",
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
    name: "Classes & Courses",
    icon: <FaIcons.FaUniversity />,
    subItems: [
      {
        name: "Courses",
        path: "/Admin/Courses/Manage",
        icon: <FaIcons.FaTasks />,
      },
      {
        name: "Schedule Courses",
        path: "/Admin/Courses/Schedule",
        icon: <AiIcons.AiOutlineCalendar />,
      },
      {
        name: "Classes",
        path: "/Admin/Classes/Manage",
        icon: <FaIcons.FaObjectGroup />,
      },
    ],
  },

  {
    name: "Transports",
    icon: <FaIcons.FaBus />,
    subItems: [
      {
        name: "Bus Fleet",
        path: "/Admin/Buses/Manage",
        icon: <FaIcons.FaBus />,
      },
    ],
  },
  {
    name: "Institution Setup",
    icon: <FaIcons.FaUniversity />,
    subItems: [
      {
        name: "Schools",
        path: "/Admin/Schools/Manage",
        icon: <FaIcons.FaUniversity />,
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
