import React, { useState, useEffect } from 'react';
import CompanyService from '../services/company.service';

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState({ id: null, name: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CompanyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setCurrentCompany(prev => ({ ...prev, name: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (currentCompany.id) {
        await CompanyService.updateCompany(currentCompany.id, currentCompany);
      } else {
        await CompanyService.createCompany(currentCompany);
      }
      setCurrentCompany({ id: null, name: '' });
      setShowCreateForm(false);
      fetchCompanies(); // recarrega empresas
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao salvar empresa.');
    }
  };

  const handleEdit = (company) => {
    setCurrentCompany(company);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Você tem certeza que deseja deletar essa empresa? Essa ação pode afetar formulários e usuários relacionados.")) {
      try {
        await CompanyService.deleteCompany(id);
        fetchCompanies(); // recarrega empresas
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao deletar empresa..');
      }
    }
  };

  if (loading) return <p className="text-center mt-5">Carregando empresas...</p>;
  if (error && !showCreateForm) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Gerenciar Empresas (Hotels)</h2>
      {error && showCreateForm && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => { setShowCreateForm(!showCreateForm); setCurrentCompany({ id: null, name: '' }); }}>
          {showCreateForm ? 'Hide Form' : 'Adicionar Nova Empresa'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-4 mb-4 shadow-sm">
          <h4 className="mb-3">{currentCompany.id ? 'Edit Company' : 'Create Company'}</h4>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label htmlFor="companyName" className="form-label">Nome da Empresa:</label>
              <input type="text" className="form-control" id="companyName" name="name" value={currentCompany.name} onChange={handleFormChange} required />
            </div>
            <button type="submit" className="btn btn-success w-100">
              {currentCompany.id ? 'Update Company' : 'Create Company'}
            </button>
          </form>
        </div>
      )}

      <ul className="list-group">
        {companies.length === 0 ? (
          <li className="list-group-item text-center text-muted">Nenhuma empresa encontrada.</li>
        ) : (
          companies.map(company => (
            <li key={company.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{company.name}</h5>
                <small>ID: {company.id}</small>
              </div>
              <div>
                <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(company)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(company.id)}>Deletar</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AdminCompaniesPage;