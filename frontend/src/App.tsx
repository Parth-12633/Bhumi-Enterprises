import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './layouts/Layout';
import EmployeesList from './pages/EmployeesList';
import EmployeeProfile from './pages/EmployeeProfile';
import EditWorkRecord from './pages/EditWorkRecord';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Sites from './pages/Sites';
import SiteProfile from './pages/SiteProfile';
import EditPayment from './pages/EditPayment';
import DailyWork from './pages/DailyWork';
import Payments from './pages/Payments';
import PaymentEntry from './pages/PaymentEntry';
import PublicStatement from './pages/PublicStatement';
import Reports from './pages/Reports';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public Routes */}
      <Route path="/statement/:id" element={<PublicStatement />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeesList />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="employees/:id/edit" element={<EditEmployee />} />
        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="daily-work" element={<DailyWork />} />
        <Route path="sites" element={<Sites />} />
        <Route path="sites/:id" element={<SiteProfile />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="edit-work/:id" element={<EditWorkRecord />} />
        <Route path="edit-payment/:id" element={<EditPayment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
