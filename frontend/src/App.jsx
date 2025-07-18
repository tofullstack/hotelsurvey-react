import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SurveyViewPage from './pages/SurveyViewPage';
import AdminFormsPage from './pages/AdminFormsPage';
import FormEditorPage from './pages/FormEditorPage';
import ReportPage from './pages/ReportPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage'; 
import AdminUsersPage from './pages/AdminUsersPage';       
import ChangePasswordPage from './pages/ChangePasswordPage'; 

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Loading user information...</p>;
  }

 
  //checa se o usuario esta logado e é um admin
  if (!user || user.profile !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

//route guard para autenticação de users que precisam trocar a senha no primeiro login
const PasswordChangeRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Loading user information...</p>;
  }

  // se o usuario nao esta logado, redireciona para o lgon
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  
  //se o usuario esta logado E não precisa alterar a senha, redireciona para a dashboard admin
  if (user && !user.mustChangePassword) {
    return <Navigate to="/admin/forms" replace />; // Or a main dashboard
  }

 
  // se o usuario esta logado e precisa trocar senha permite o acesso para troca(ChangePasswordPage)
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* rotas publicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/survey/:companyId/:language/:sectionId?" element={<SurveyViewPage />} />

          {/* rota para trocar senha se primeiro login */}
          <Route path="/change-password" element={<PasswordChangeRoute><ChangePasswordPage /></PasswordChangeRoute>} />

          {/* admn rota protegida */}
          {/* pagina default do admin*/}
          <Route path="/admin" element={<AdminRoute><AdminFormsPage /></AdminRoute>} />
          <Route path="/admin/forms" element={<AdminRoute><AdminFormsPage /></AdminRoute>} />
          <Route path="/admin/forms/new" element={<AdminRoute><FormEditorPage /></AdminRoute>} />
          <Route path="/admin/forms/edit/:formId" element={<AdminRoute><FormEditorPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportPage /></AdminRoute>} />
          <Route path="/admin/companies" element={<AdminRoute><AdminCompaniesPage /></AdminRoute>} /> {/* nova empresa rota*/}
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />       {/* novo usuario rota*/}

          {/* rota redireciona para o login default  */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;