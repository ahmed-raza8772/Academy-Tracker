import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Layouts & Utils
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Home from "./pages/Dashboard/Home";
import Blank from "./pages/Blank";

// Admin Pages
import AdminDashboard from "./pages/AdminPages/Home";

//Related Classes
import AddClasses from "./pages/AdminPages/relatedClasses/AddClasses";
import ManageClasses from "./pages/AdminPages/relatedClasses/ManageClasses";

//Related Courses
import AddCourses from "./pages/AdminPages/relatedCourses/AddCourses";
import ManageCourses from "./pages/AdminPages/relatedCourses/ManageCourses";

//Schedule Courses
import ScheduleManagement from "./pages/AdminPages/relatedSchedule/ScheduleManagement";

//Related Students
import AddStudents from "./pages/AdminPages/relatedStudents/AddStudents";
import ManageStudents from "./pages/AdminPages/relatedStudents/ManageSudents";
import ViewStudent from "./pages/AdminPages/relatedStudents/ViewStudent";

//Related Users (login)
import AddUsers from "./pages/AdminPages/relatedUsers/AddUsers";
import Users from "./pages/AdminPages/relatedUsers/Users";

//Related Transport
import AddBuses from "./pages/AdminPages/relatedBuses/AddBuses";
import ManageBuses from "./pages/AdminPages/relatedBuses/ManageBuses";

// Auth store
import { useAuthStore } from "./hooks/useAuth";
import Loader from "./components/common/Loader";

// --- Helpers ---
function isTokenValid(token) {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true; // If no expiration, assume valid

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

// --- Wrappers ---
const AuthWrapper = ({ children, requiredRole = null }) => {
  const { token, userRole } = useAuthStore(); // Get role from auth store
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (isChecking) return <Loader />;

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/Account/login" replace />;
  }

  // Role-based protection
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role from store
    const redirectPath = getDashboardPath(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const AuthPageWrapper = ({ children }) => {
  const { token, userRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (isChecking) return <Loader />;

  if (token && isTokenValid(token) && userRole) {
    const redirectPath = getDashboardPath(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// --- Helper function for dashboard paths ---
const getDashboardPath = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/Admin/Dashboard";
    case "teacher":
      return "/Teacher/Dashboard";
    case "student":
      return "/Student/Dashboard";
    case "parent":
      return "/Parents/Dashboard";
    default:
      return "/Admin/Dashboard"; // Default to admin
  }
};

// --- RootRedirect helper ---
const RootRedirect = () => {
  const { token, userRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (isChecking) return <Loader />;

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/Account/login" replace />;
  }

  const redirectPath = getDashboardPath(userRole);
  return <Navigate to={redirectPath} replace />;
};

// --- App Routes ---
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/Account/login"
          element={
            <AuthPageWrapper>
              <SignIn />
            </AuthPageWrapper>
          }
        />
        <Route
          path="/Account/register"
          element={
            <AuthPageWrapper>
              <SignUp />
            </AuthPageWrapper>
          }
        />
        <Route
          path="/Account/forgot"
          element={
            <AuthPageWrapper>
              <ForgotPassword />
            </AuthPageWrapper>
          }
        />

        {/* Protected Routes by Role */}

        {/* Admin Routes */}
        <Route
          path="/Admin/*"
          element={
            <AuthWrapper requiredRole="admin">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<AdminDashboard />} />
          <Route path="Classes/Add" element={<AddClasses />} />
          <Route path="Classes/Manage" element={<ManageClasses />} />
          <Route path="Courses/Add" element={<AddCourses />} />
          <Route path="Courses/Manage" element={<ManageCourses />} />
          <Route path="Courses/Schedule" element={<ScheduleManagement />} />
          <Route path="Students/Add" element={<AddStudents />} />
          <Route path="Students/Manage" element={<ManageStudents />} />
          <Route path="Students/:id" element={<ViewStudent />} />
          <Route path="Users/Add" element={<AddUsers />} />
          <Route path="Users/Manage" element={<Users />} />
          <Route path="Buses/Add" element={<AddBuses />} />
          <Route path="Buses/Manage" element={<ManageBuses />} />
          <Route path="*" element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/Student/*"
          element={
            <AuthWrapper requiredRole="student">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="MyCourses" element={<Blank />} />
          <Route path="Assignments" element={<Blank />} />
          <Route path="Messages" element={<Blank />} />
          <Route path="*" element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/Teacher/*"
          element={
            <AuthWrapper requiredRole="teacher">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="MyClasses" element={<Blank />} />
          <Route path="Assignments" element={<Blank />} />
          <Route path="Reports" element={<Blank />} />
          <Route path="*" element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Parent Routes */}
        <Route
          path="/Parents/*"
          element={
            <AuthWrapper requiredRole="parent">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="ChildrenProgress" element={<Blank />} />
          <Route path="Messages" element={<Blank />} />
          <Route path="Reports" element={<Blank />} />
          <Route path="*" element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Common routes accessible to all authenticated users */}
        <Route
          path="/*"
          element={
            <AuthWrapper>
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="profile" element={<UserProfiles />} />
          <Route path="blank" element={<Blank />} />
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
