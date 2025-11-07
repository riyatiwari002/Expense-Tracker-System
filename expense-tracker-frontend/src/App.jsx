import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import AdminPanel from "./pages/AdminPanel/AdminPanel.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Transactions from "./pages/Transactions/Transactions.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Cookies from "js-cookie";

//  Protected Route Wrapper
const ProtectedRoute = ({ element }) => {
  const userInfo = Cookies.get("userInfo");
  return userInfo ? element : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const location = useLocation();

  //  Hide Navbar only on Admin Panel
  const hideNavbar = location.pathname === "/adminPanel";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/adminPanel"
          element={<ProtectedRoute element={<AdminPanel />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/transaction"
          element={<ProtectedRoute element={<Transactions />} />}
        />
        <Route
          path="/category"
          element={<ProtectedRoute element={<Categories />} />}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute element={<Reports />} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />

        {/* Fallback: Unknown Route → Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
