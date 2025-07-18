import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormService from '../services/form.service';
import CompanyService from '../services/company.service'; // Import CompanyService

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    language: '',
    companyId: '', // guarda o id da empresa
    denyUse: false,
    active: true,
    questions: [{ id: null, label: '', type: 'TEXT', mandatory: false, options: [] }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewForm, setIsNewForm] = useState(true);
  const [companies, setCompanies] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCompanies = await CompanyService.getAllCompanies();
        setCompanies(fetchedCompanies);

        if (formId) {
          setIsNewForm(false);
          const data = await FormService.getFormById(formId);
          const formattedQuestions = data.questions.map(q => ({
            ...q,
            options: q.options || []
          }));
          setFormData({ ...data, questions: formattedQuestions });
        } else {
          setIsNewForm(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionsChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].options = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { id: null, label: '', type: 'TEXT', mandatory: false, options: [] }]
    }));
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const dataToSend = {
        ...formData,
        companyId: parseInt(formData.companyId) // garante que companyId é um number
      };

      if (isNewForm) {
        await FormService.createForm(dataToSend);
      } else {
        await FormService.updateForm(formId, dataToSend);
      }
      navigate('/admin/forms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading form data and companies...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">{isNewForm ? 'Create New Form' : `Edit Form: ${formData.name}`}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Form Name:</label>
          <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">Language:</label>
          <input type="text" className="form-control" id="language" name="language" value={formData.language} onChange={handleInputChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="companyId" className="form-label">Company:</label>
          <select className="form-select" id="companyId" name="companyId" value={formData.companyId} onChange={handleInputChange} required>
            <option value="">Select a Company</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="denyUse" name="denyUse" checked={formData.denyUse} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="denyUse">Allow "Did not use service" option for sections</label>
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="active" name="active" checked={formData.active} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="active">Active (publicly visible)</label>
        </div>

        <h3 className="mt-4">Questions</h3>
        {formData.questions.map((q, index) => (
          <div key={index} className="card mb-3 p-3 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Question {index + 1}</h5>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(index)}>Remove</button>
            </div>
            <div className="mb-3">
              <label htmlFor={`label-${index}`} className="form-label">Label:</label>
              <input type="text" className="form-control" id={`label-${index}`} name="label" value={q.label} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="mb-3">
              <label htmlFor={`type-${index}`} className="form-label">Type:</label>
              <select className="form-control" id={`type-${index}`} name="type" value={q.type} onChange={(e) => handleQuestionChange(index, e)}>
                <option value="TEXT">Text</option>
                <option value="CHOICE">Choice</option>
                <option value="YES_NO">Yes/No</option>
                <option value="SCALE">Scale</option>
              </select>
            </div>
            {q.type === 'CHOICE' || q.type === 'SCALE' ? (
              <div className="mb-3">
                <label htmlFor={`options-${index}`} className="form-label">Options (comma-separated):</label>
                <input
                  type="text"
                  className="form-control"
                  id={`options-${index}`}
                  name="options"
                  value={q.options ? q.options.join(', ') : ''}
                  onChange={(e) => handleOptionsChange(index, e.target.value)}
                />
              </div>
            ) : null}
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id={`mandatory-${index}`} name="mandatory" checked={q.mandatory} onChange={(e) => handleQuestionChange(index, e)} />
              <label className="form-check-label" htmlFor={`mandatory-${index}`}>Mandatory</label>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={addQuestion}>Add Question</button>

        <button type="submit" className="btn btn-primary w-100">{isNewForm ? 'Create Form' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default FormEditorPage;