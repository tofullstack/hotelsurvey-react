import React, { useState, useEffect } from 'react';
import QuestionComponent from './QuestionComponent';
import PublicSurveyService from '../services/public.survey.service';

const SurveyForm = ({ companyId, language }) => {
  const [surveyStructure, setSurveyStructure] = useState([]);
  const [answers, setAnswers] = useState({});
  const [freeTextFeedback, setFreeTextFeedback] = useState('');
  const [guestIdentifier, setGuestIdentifier] = useState('');
  const [deniedServices, setDeniedServices] = useState({}); // {sectionId: true/false}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error'

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await PublicSurveyService.getSurveyQuestions(companyId, language);
        setSurveyStructure(data);
        //inicializa o estado de respostas e de 'denyUse'
        const initialAnswers = {};
        const initialDenied = {};
        data.forEach(section => {
          section.questions.forEach(question => {
            initialAnswers[question.id] = ''; // Iinicializa com string vazia
          });
          if (section.denyUse) {
            initialDenied[section.id] = false; // inicializa 'denyUse' como false
          }
        });
        setAnswers(initialAnswers);
        setDeniedServices(initialDenied);
        setLoading(false);
      } catch (err) {
        setError('Failed to load survey. Please try again later.');
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [companyId, language]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleDenyUseChange = (sectionId, isChecked) => {
    setDeniedServices(prev => ({
      ...prev,
      [sectionId]: isChecked,
    }));

    // se marcou 'não utilizei', limpa as respostas das perguntas daquela seção
    if (isChecked) {
      const sectionQuestions = surveyStructure.find(s => s.id === sectionId)?.questions;
      if (sectionQuestions) {
        setAnswers(prevAnswers => {
          const newAnswers = { ...prevAnswers };
          sectionQuestions.forEach(q => {
            newAnswers[q.id] = ''; // define a resposta como vazia para perguntas da seção negada
          });
          return newAnswers;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setError(null);

    const submittedAnswers = [];
    let isValid = true;

    // frontend validation before sending to backend
    for (const section of surveyStructure) {
      const sectionDenied = deniedServices[section.id];
      for (const question of section.questions) {
        // encontra a pergunta original para verificar se é obrigatória
        // (a estrutura PublicSurveySectionDto não inclui 'mandatory',
        // você precisaria que o backend retornasse 'mandatory' também para validação frontend completa)
        // por simplicidade aqui, vamos assumir que 'mandatory' vem na estrutura do question.
        // se 'mandatory' não for retornado, esta validação precisa ser ajustada ou removida no frontend.

        const isMandatory = question.mandatory; // assumindo que a API pública retorna este campo

        // se a seção não foi negada E a pergunta é obrigatória E não há resposta
        if (isMandatory && !sectionDenied && (!answers[question.id] || answers[question.id].trim() === '')) {
          setError(`Please answer the mandatory question: "${question.label}" in section "${section.name}".`);
          isValid = false;
          break; // Ssai do loop de perguntas
        }

        submittedAnswers.push({
          questionId: question.id,
          surveySectionId: section.id,
          answerValue: sectionDenied ? '' : answers[question.id] || '', // se negado, envia string vazia
          didNotUseService: sectionDenied,
        });
      }
      if (!isValid) break; // sai do loop de seções
    }

    if (!isValid) return;

    const surveyData = {
      companyId: parseInt(companyId), //converte para número
      language: language,
      guestIdentifier: guestIdentifier,
      freeTextFeedback: freeTextFeedback,
      answers: submittedAnswers,
    };

    try {
      await PublicSurveyService.submitSurveyResponse(surveyData);
      setSubmissionStatus('success');
      // Opcional: Limpar formulário, redirecionar, etc.
      setAnswers({});
      setFreeTextFeedback('');
      setGuestIdentifier('');
      setDeniedServices({});
      // após o sucesso, você pode querer recarregar a página ou mostrar uma mensagem final.
    } catch (err) {
      setSubmissionStatus('error');
      // a mensagem de erro pode vir em err.response.data se o backend forçar um JSON de erro
      // ou err.message para erros de rede
      setError(err.response?.data?.message || err.message || 'Failed to submit survey.');
    }
  };

  if (loading) return <p>Loading survey...</p>;
  if (error && !submissionStatus) return <p className="text-danger">Error: {error}</p>; // mostrar erro de carregamento inicial

  if (submissionStatus === 'success') {
    return <div className="alert alert-success text-center py-5"><h3>Thank you for your feedback! Your response has been submitted.</h3></div>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Guest Satisfaction Survey</h2>
      {submissionStatus === 'error' && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="guestIdentifier" className="form-label">Your Identifier (optional):</label>
          <input
            type="text"
            className="form-control"
            id="guestIdentifier"
            value={guestIdentifier}
            onChange={(e) => setGuestIdentifier(e.target.value)}
            placeholder="e.g., Room Number, Email"
          />
        </div>

        {surveyStructure.map(section => (
          <div key={section.id} className="card mb-4">
            <div className="card-header bg-light">
              <h4 className="mb-0">{section.name}</h4>
              {section.denyUse && (
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`denyUseSection-${section.id}`}
                    checked={deniedServices[section.id]}
                    onChange={(e) => handleDenyUseChange(section.id, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`denyUseSection-${section.id}`}>
                    Não utilizei este serviço/setor
                  </label>
                </div>
              )}
            </div>
            <div className="card-body">
              {!deniedServices[section.id] ? (
                section.questions.map(question => (
                  <QuestionComponent
                    key={question.id}
                    question={question} // passa o objeto question completo
                    value={answers[question.id]}
                    onChange={(val) => handleAnswerChange(question.id, val)}
                    isSectionDenied={deniedServices[section.id]}
                  />
                ))
              ) : (
                <p className="text-muted">Você marcou que não utilizou este serviço/setor. Nenhuma pergunta será exibida.</p>
              )}
            </div>
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="freeTextFeedback" className="form-label">Additional Feedback (optional):</label>
          <textarea
            className="form-control"
            id="freeTextFeedback"
            rows="4"
            value={freeTextFeedback}
            onChange={(e) => setFreeTextFeedback(e.target.value)}
            placeholder="Write your additional comments here..."
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100">Submit Feedback</button>
      </form>
    </div>
  );
};

export default SurveyForm;