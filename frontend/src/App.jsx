
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SurveyViewPage from './pages/SurveyViewPage';
import AdminFormsPage from './pages/AdminFormsPage';
import FormEditorPage from './pages/FormEditorPage';
import ReportPage from './pages/ReportPage';
import AdminLayout from './layouts/AdminLayout';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import CompanyForm from './components/CompanyForm';
import ChangePasswordPage from './pages/ChangePasswordPage';
import UserManagementPage from './pages/UserManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage'; 

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Carregando informações do usuário...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona para a página de acesso negado se o perfil não for ADMIN
  if (user.profile !== 'ADMIN') {
    return <Navigate to="/access-denied" replace />;
  }
  
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/survey/:formId/:language" element={<SurveyViewPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} /> 
          
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminFormsPage />} />
            <Route path="forms" element={<AdminFormsPage />} />
            <Route path="forms/new" element={<FormEditorPage />} />
            <Route path="forms/edit/:formId" element={<FormEditorPage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="companies/new" element={<CompanyForm />} />
            <Route path="companies/edit/:id" element={<CompanyForm />} />
            
            <Route path="users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;