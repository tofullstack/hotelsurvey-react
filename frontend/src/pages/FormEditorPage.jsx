import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormService from '../services/form.service';

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    language: '',
    companyId: '', // assuma que um admin saberá o companyId ou haverá um seletor
    denyUse: false,
    active: true,
    questions: [{ id: null, label: '', type: 'TEXT', mandatory: false, options: '' }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewForm, setIsNewForm] = useState(true);

  useEffect(() => {
    if (formId) {
      setIsNewForm(false);
      const fetchForm = async () => {
        try {
          const data = await FormService.getFormById(formId);
          setFormData(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load form for editing.');
          setLoading(false);
        }
      };
      fetchForm();
    } else {
      setLoading(false);
      setIsNewForm(true);
    }
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

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { id: null, label: '', type: 'TEXT', mandatory: false, options: '' }]
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
      if (isNewForm) {
        await FormService.createForm(formData);
      } else {
        await FormService.updateForm(formId, formData);
      }
      navigate('/admin/forms'); // redireciona de volta para a lista após salvar
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading form...</p>;
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
          <label htmlFor="companyId" className="form-label">Company ID:</label>
          <input type="number" className="form-control" id="companyId" name="companyId" value={formData.companyId} onChange={handleInputChange} required />
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
                <label htmlFor={`options-${index}`} className="form-label">Options (comma-separated for Choice/Scale):</label>
                <input type="text" className="form-control" id={`options-${index}`} name="options" value={q.options} onChange={(e) => handleQuestionChange(index, e)} />
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