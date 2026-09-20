import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from '../features/capsules/pages/DashboardPage.jsx';
import LandingPage from '../features/marketing/pages/LandingPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
