import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link } from 'react-router-dom';

const AdminFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await FormService.getAllForms();
        setForms(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load forms.');
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleGenerateQr = (form) => {
    setSelectedFormForQr(form);
  };

  const getSurveyFrontendUrl = (form) => {
    // a URL base do frontend onde o SurveyViewPage é renderizado
    // ajuste 'http://localhost:5173' para o domínio do frontend em produção
    return `http://localhost:5173/survey/${form.companyId}/${form.language}`;
  };

  const handleDeactivate = async (formId) => {
    if (window.confirm("Are you sure you want to deactivate this form?")) {
      try {
        await FormService.deactivateForm(formId);
        setForms(forms.map(f => f.id === formId ? { ...f, active: false } : f));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate form.');
      }
    }
  };

  const handleActivate = async (formId) => {
    try {
      await FormService.activateForm(formId);
      setForms(forms.map(f => f.id === formId ? { ...f, active: true } : f));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate form.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading forms...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Manage Survey Forms</h2>
      <div className="d-flex justify-content-end mb-3">
        <Link to="/admin/forms/new" className="btn btn-success">Create New Form</Link>
      </div>

      <ul className="list-group">
        {forms.length === 0 ? (
          <li className="list-group-item text-center text-muted">No forms found.</li>
        ) : (
          forms.map(form => (
            <li key={form.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{form.name} ({form.language})</h5>
                <small>Company ID: {form.companyId} | Status: {form.active ? 'Active' : 'Inactive'}</small>
              </div>
              <div>
                <Link to={`/admin/forms/edit/${form.id}`} className="btn btn-sm btn-info me-2">Edit</Link>
                <Link to={`/admin/forms/preview/${form.id}`} className="btn btn-sm btn-secondary me-2">Preview</Link>
                {form.active ? (
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleDeactivate(form.id)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleActivate(form.id)}
                  >
                    Activate
                  </button>
                )}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleGenerateQr(form)}
                >
                  Generate QR Code
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {selectedFormForQr && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h5>QR Code for: {selectedFormForQr.name} ({selectedFormForQr.language})</h5>
          <QRCodeDisplay url={getSurveyFrontendUrl(selectedFormForQr)} size={256} />
        </div>
      )}
    </div>
  );
};

export default AdminFormsPage;