import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const [searchCompany, setSearchCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await FormService.searchForms(searchCompany, filterStatus);
      setForms(results);
      setError(null);
    } catch (err) {
      setError('Erro ao buscar formulários com filtros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await FormService.getAllForms();
        setForms(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar formulários.');
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleGenerateQr = (form) => {
    setSelectedFormForQr(form);
  };

  const getSurveyFrontendUrl = (form) => {
    // A URL AGORA INCLUI O ID DA SEÇÃO (FORM.ID)
    return `http://localhost:5173/survey/${form.companyId}/${form.language}/${form.id}`;
  };

  const handleDeactivate = async (formId) => {
    if (window.confirm("Certeza que deseja desativar este formulário?")) {
      try {
        await FormService.deactivateForm(formId);
        setForms(forms.map(f => f.id === formId ? { ...f, active: false } : f));
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao desativar formulário.');
      }
    }
  };

  const handleActivate = async (formId) => {
    try {
      await FormService.activateForm(formId);
      setForms(forms.map(f => f.id === formId ? { ...f, active: true } : f));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao ativar formulário.');
    }
  };

  if (loading) return <p className="text-center mt-5">Carregando formulários...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gerenciamento Formulários de Pesquisa</h2>
        <div>
          <button className="btn btn-danger me-2" onClick={logout}>Logout</button>
          <Link to="/admin/forms/new" className="btn btn-success">Novo Formulário</Link>
        </div>
      </div>
      <div className="mb-3 d-flex gap-2">
  <input
    type="text"
    className="form-control"
    placeholder="Buscar por nome da empresa"
    value={searchCompany}
    onChange={(e) => setSearchCompany(e.target.value)}
  />
  <select
    className="form-select"
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="todos">Todos</option>
    <option value="ativos">Ativos</option>
    <option value="inativos">Inativos</option>
  </select>
  <button className="btn btn-primary" onClick={handleSearch}>Buscar</button>
</div>



      <ul className="list-group">
        {forms.length === 0 ? (
          <li className="list-group-item text-center text-muted">Nenhum formulário encontrado.</li>
        ) : (
          forms.map(form => (
            <li key={form.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{form.name} ({form.language})</h5>
                <small>Empresa ID {form.companyId} | Status: {form.active ? 'Ativo' : 'Inativo'}</small>
              </div>
              <div>
                <Link to={`/admin/forms/edit/${form.id}`} className="btn btn-sm btn-info me-2">Editar</Link>
                <Link to={`/admin/forms/preview/${form.id}`} className="btn btn-sm btn-secondary me-2">Preview</Link>
                {form.active ? (
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleDeactivate(form.id)}
                  >
                    Desativar
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleActivate(form.id)}
                  >
                    Ativar
                  </button>
                )}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleGenerateQr(form)}
                >
                  Gerar QR Code
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {selectedFormForQr && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h5>QR Code para: {selectedFormForQr.name} ({selectedFormForQr.language})</h5>
          <QRCodeDisplay url={getSurveyFrontendUrl(selectedFormForQr)} size={256} />
        </div>
      )}
    </div>
  );
};

export default AdminFormsPage;