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
import AddClasses from "./pages/AdminPages/relatedClasses/AddClasses";
import ManageClasses from "./pages/AdminPages/relatedClasses/ManageClasses";

// Role-specific pages (you'll need to create these)
// import StudentDashboard from "./pages/StudentPages/Home";
// import TeacherDashboard from "./pages/TeacherPages/Home";
// import ParentDashboard from "./pages/ParentPages/Home";

// Auth store
import { useAuthStore } from "./hooks/useAuth";
import Loader from "./components/common/Loader";
import AddStudents from "./pages/AdminPages/relatedStudents/AddStudents";
import ManageStudents from "./pages/AdminPages/relatedStudents/ManageSudents";

// --- Helpers ---
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// --- Wrappers ---
const AuthWrapper = ({ children, requiredRole = null }) => {
  const { token, userRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (isChecking) return <Loader />;

  const isExpired = !token || isTokenExpired(token);
  if (isExpired) return <Navigate to="/Account/login" replace />;

  // Role-based protection
  if (requiredRole && userRole !== requiredRole) {
    switch (userRole) {
      case "Admin":
        return <Navigate to="/Admin/Dashboard" replace />;
      case "Teacher":
        return <Navigate to="/Teacher/Dashboard" replace />;
      case "Student":
        return <Navigate to="/Student/Dashboard" replace />;
      default:
        return <Navigate to="/Parents/Dashboard" replace />;
    }
  }

  return children;
};

// --- RootRedirect helper ---
const RootRedirect = () => {
  const { token, userRole } = useAuthStore();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/Account/login" replace />;
  }

  switch (userRole) {
    case "Admin":
      return <Navigate to="/Admin/Dashboard" replace />;
    case "Teacher":
      return <Navigate to="/Teacher/Dashboard" replace />;
    case "Student":
      return <Navigate to="/Student/Dashboard" replace />;
    default:
      return <Navigate to="/Parents/Dashboard" replace />;
  }
};

const AuthPageWrapper = ({ children }) => {
  const { token, userRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (isChecking) return <Loader />;

  if (token && !isTokenExpired(token) && userRole) {
    switch (userRole) {
      case "Admin":
        return <Navigate to="/Admin/Dashboard" replace />;
      case "Teacher":
        return <Navigate to="/Teacher/Dashboard" replace />;
      case "Student":
        return <Navigate to="/Student/Dashboard" replace />;
      default:
        return <Navigate to="/Parents/Dashboard" replace />;
    }
  }

  return children;
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
            <AuthWrapper requiredRole="Admin">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<AdminDashboard />} />
          <Route path="Classes/Add" element={<AddClasses />} />
          <Route path="Classes/Manage" element={<ManageClasses />} />
          <Route path="Students/Add" element={<AddStudents />} />
          <Route path="Students/Manage" element={<ManageStudents />} />
          <Route index element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/Student/*"
          element={
            <AuthWrapper requiredRole="Student">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="MyCourses" element={<Blank />} />
          <Route path="Assignments" element={<Blank />} />
          <Route path="Messages" element={<Blank />} />
          <Route index element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/Teacher/*"
          element={
            <AuthWrapper requiredRole="Teacher">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="MyClasses" element={<Blank />} />
          <Route path="Assignments" element={<Blank />} />
          <Route path="Reports" element={<Blank />} />
          <Route index element={<Navigate to="Dashboard" replace />} />
        </Route>

        {/* Parent Routes */}
        <Route
          path="/Parents/*"
          element={
            <AuthWrapper requiredRole="Parent">
              <AppLayout />
            </AuthWrapper>
          }
        >
          <Route path="Dashboard" element={<Blank />} />
          <Route path="ChildrenProgress" element={<Blank />} />
          <Route path="Messages" element={<Blank />} />
          <Route path="Reports" element={<Blank />} />
          <Route index element={<Navigate to="Dashboard" replace />} />
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
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
