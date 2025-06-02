import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ResetPassword from './components/ResetPassword';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateAssessment from './pages/CreateAssessment';
import Assessment from './pages/Assessment';
import EditAssessment from './pages/EditAssessment';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import StudentAssessment from './pages/StudentAssessment';
import StudentTakeAssessment from './pages/StudentTakeAssessment';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import ViewInstructor from './pages/ViewInstructor';
import ViewStudent from './pages/ViewStudent';
import { isAuthenticated, getUserRole } from './services/api';
import './App.css';

// Role-based route protection
const RoleRoute = ({ element, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getUserRole();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || 
                    location.pathname === '/login' || 
                    location.pathname === '/register' ||
                    location.pathname === '/reset-password';

  return (
    <div className="App">
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? 'full-height' : ''}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/instructor/assessment/:courseId" element={<Assessment />} />
          <Route path="/instructor/assessment/:courseId/create" element={<CreateAssessment />} />
          <Route path="/instructor/assessment" element={<RoleRoute element={<Assessment />} allowedRoles={['Instructor']} />} />
          <Route path="/instructor/editassessment/:assessmentId" element={<RoleRoute element={<EditAssessment />} allowedRoles={['Instructor']} />} />
          <Route path="/instructor/addcourse" element={<RoleRoute element={<AddCourse />} allowedRoles={['Instructor']} />} />
          <Route path="/instructor/editcourse/:courseId" element={<EditCourse />} />
          <Route path="/student/assessment/:courseId" element={<StudentAssessment />} />
          <Route path="/student/take-assessment/:assessmentId" element={<StudentTakeAssessment />} />
          <Route path="/instructor/assessment/:assessmentId/results" element={<ResultPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/instructors" element={<ViewInstructor />} />
          <Route path="/admin/students" element={<ViewStudent />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
