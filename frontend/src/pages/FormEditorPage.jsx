import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormService from '../services/form.service';
import CompanyService from '../services/company.service'; 

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    language: '',
    companyId: '', // guarda o id da empresa
    denyUse: false,
    active: true,
    questions: [{ id: null, label: '', type: 'TEXT', mandatory: false, options: [], scaleStart: '', scaleEnd: '' }] // adiciona scaleStart e scaleEnd
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
            options: q.options || [],
            scaleStart: q.scaleStart || '', // garante que scaleStart seja inicializado
            scaleEnd: q.scaleEnd || ''     // garante que scaleEnd seja inicializado
          }));
          setFormData({ ...data, questions: formattedQuestions });
        } else {
          setIsNewForm(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar dados.');
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

  const generateScaleOptions = (start, end) => {
    const options = [];
    const numStart = parseInt(start, 10);
    const numEnd = parseInt(end, 10);

    if (!isNaN(numStart) && !isNaN(numEnd) && numStart <= numEnd) {
      for (let i = numStart; i <= numEnd; i++) {
        options.push(String(i)); // armazena como string para consistência com as outras opções
      }
    }
    return options;
  };

  const handleQuestionChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...formData.questions];
    let updatedQuestion = {
      ...newQuestions[index],
      [name]: type === 'checkbox' ? checked : value
    };

    // se o tipo mudar para SCALE ou se scaleStart/scaleEnd for alterado
    if (name === 'type' && value === 'SCALE') {
      // limpa as opções existentes e define valores padrão para a escala
      updatedQuestion.options = [];
      updatedQuestion.scaleStart = updatedQuestion.scaleStart || '1'; // define 1 como padrão se não houver
      updatedQuestion.scaleEnd = updatedQuestion.scaleEnd || '5';     // define 5 como padrão se não houver
      updatedQuestion.options = generateScaleOptions(updatedQuestion.scaleStart, updatedQuestion.scaleEnd);
    } else if (updatedQuestion.type === 'SCALE' && (name === 'scaleStart' || name === 'scaleEnd')) {
      updatedQuestion.options = generateScaleOptions(
        name === 'scaleStart' ? value : updatedQuestion.scaleStart,
        name === 'scaleEnd' ? value : updatedQuestion.scaleEnd
      );
    } else if (name === 'type' && value !== 'SCALE') {
      // se o tipo mudar de SCALE para outra coisa, limpa scaleStart e scaleEnd
      updatedQuestion.scaleStart = '';
      updatedQuestion.scaleEnd = '';
    }

    newQuestions[index] = updatedQuestion;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSingleOptionChange = (questionIndex, optionIndex, newValue) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = newValue;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push('');
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
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
      questions: [...prev.questions, { id: null, label: '', type: 'TEXT', mandatory: false, options: [], scaleStart: '', scaleEnd: '' }]
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

      // limpa scaleStart e scaleEnd de perguntas que não são do tipo 'SCALE' antes de enviar
      dataToSend.questions = dataToSend.questions.map(q => {
        if (q.type !== 'SCALE') {
          const { scaleStart, scaleEnd, ...rest } = q;
          return rest;
        }
        return q;
      });

      if (isNewForm) {
        await FormService.createForm(dataToSend);
      } else {
        await FormService.updateForm(formId, dataToSend);
      }
      navigate('/admin/forms');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao salvar formulário.');
    }
  };

  if (loading) return <p className="text-center mt-5">Carregando dados do formulário e empresas...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">{isNewForm ? 'Criar Novo Formulário' : `Editar Formulário: ${formData.name}`}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome do Formulário:</label>
          <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">Idioma:</label>
          <select className="form-select" id="language" name="language" value={formData.language} onChange={handleInputChange} required>
            <option value="">Selecione o Idioma</option>
            <option value="pt-BR">Português</option>
            <option value="en">Inglês</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="companyId" className="form-label">Empresa:</label>
          <select className="form-select" id="companyId" name="companyId" value={formData.companyId} onChange={handleInputChange} required>
            <option value="">Selecione uma Empresa</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="denyUse" name="denyUse" checked={formData.denyUse} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="denyUse">Permitir opção "Não utilizou o serviço" para seções</label>
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="active" name="active" checked={formData.active} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="active">Ativo (visível publicamente)</label>
        </div>

        <h3 className="mt-4">Perguntas</h3>
        {formData.questions.map((q, index) => (
          <div key={index} className="card mb-3 p-3 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pergunta {index + 1}</h5>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(index)}>Remover</button>
            </div>
            <div className="mb-3">
              <label htmlFor={`label-${index}`} className="form-label">Pergunta:</label>
              <input type="text" className="form-control" id={`label-${index}`} name="label" value={q.label} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="mb-3">
              <label htmlFor={`type-${index}`} className="form-label">Tipo:</label>
              <select className="form-control" id={`type-${index}`} name="type" value={q.type} onChange={(e) => handleQuestionChange(index, e)}>
                <option value="TEXT">Texto</option>
                <option value="CHOICE">Múltipla Escolha</option>
                <option value="YES_NO">Sim/Não</option>
                <option value="SCALE">Escala</option>
              </select>
            </div>
            {q.type === 'CHOICE' && (
  <div className="mb-3">
    <label className="form-label">Opções:</label>
    {q.options && q.options.length > 0 && q.options.map((option, optIndex) => (
      <div key={optIndex} className="input-group mb-2">
        <input
          type="text"
          className="form-control"
          value={option}
          onChange={(e) => handleSingleOptionChange(index, optIndex, e.target.value)}
        />
        <button type="button" className="btn btn-outline-danger" onClick={() => removeOption(index, optIndex)}>
          Remover
        </button>
      </div>
    ))}
    <button type="button" className="btn btn-outline-secondary" onClick={() => addOption(index)}>
      Adicionar Opção
    </button>
  </div>
)}

            {q.type === 'SCALE' ? ( // exibe os campos de escala apenas para o tipo SCALE
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor={`scaleStart-${index}`} className="form-label">Início da Escala:</label>
                  <input
                    type="number"
                    className="form-control"
                    id={`scaleStart-${index}`}
                    name="scaleStart"
                    value={q.scaleStart}
                    onChange={(e) => handleQuestionChange(index, e)}
                    min="1" // Adiciona uma validação mínima
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor={`scaleEnd-${index}`} className="form-label">Fim da Escala:</label>
                  <input
                    type="number"
                    className="form-control"
                    id={`scaleEnd-${index}`}
                    name="scaleEnd"
                    value={q.scaleEnd}
                    onChange={(e) => handleQuestionChange(index, e)}
                    min={q.scaleStart ? parseInt(q.scaleStart, 10) + 1 : "2"} // garante que o fim seja maior que o início
                  />
                </div>
              </div>
            ) : null}
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id={`mandatory-${index}`} name="mandatory" checked={q.mandatory} onChange={(e) => handleQuestionChange(index, e)} />
              <label className="form-check-label" htmlFor={`mandatory-${index}`}>Obrigatória</label>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={addQuestion}>Adicionar Pergunta</button>

        <button type="submit" className="btn btn-primary w-100">{isNewForm ? 'Criar Formulário' : 'Salvar Alterações'}</button>
      </form>
    </div>
  );
};

export default FormEditorPage;