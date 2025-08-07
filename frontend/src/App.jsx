import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SurveyViewPage from './pages/SurveyViewPage';
import AdminFormsPage from './pages/AdminFormsPage';
import FormEditorPage from './pages/FormEditorPage';
import ReportPage from './pages/ReportPage';
import AdminLayout from './layouts/AdminLayout';

// componente de guarda de rota para ADMIN
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-5">Loading user information...</p>;
  }

  // se o usuário não está logado ou não é ADMIN, redireciona para o login
  if (!user || user.profile !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          {/* rota para o hóspede responder a pesquisa */}

          <Route path="/survey/:formId/:language" element={<SurveyViewPage />} />




          {/* rotas Administrativas (Protegidas por AdminRoute) */}
          {/* <Route path="/admin" element={<AdminRoute><AdminFormsPage /></AdminRoute>} />
          <Route path="/admin/forms" element={<AdminRoute><AdminFormsPage /></AdminRoute>} />
          <Route path="/admin/forms/new" element={<AdminRoute><FormEditorPage /></AdminRoute>} />
          <Route path="/admin/forms/edit/:formId" element={<AdminRoute><FormEditorPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportPage /></AdminRoute>} /> */}

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminFormsPage />} />
            <Route path="forms" element={<AdminFormsPage />} />
            <Route path="forms/new" element={<FormEditorPage />} />
            <Route path="forms/edit/:formId" element={<FormEditorPage />} />
            <Route path="reports" element={<ReportPage />} />
          </Route>



          {/* rota padrão: Redireciona para o login se nenhuma rota corresponder */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;