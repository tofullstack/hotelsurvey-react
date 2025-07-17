import React, { useState, useEffect } from 'react';
import QuestionComponent from './QuestionComponent';
import PublicSurveyService from '../services/public.survey.service';

// adiciona sectionId como uma prop opcional
const SurveyForm = ({ companyId, language, sectionId = null }) => {
  const [surveyStructure, setSurveyStructure] = useState([]); // será um array de seções
  const [answers, setAnswers] = useState({});
  const [freeTextFeedback, setFreeTextFeedback] = useState('');
  const [guestIdentifier, setGuestIdentifier] = useState('');
  const [deniedServices, setDeniedServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        let data;
        if (sectionId) {
          // se sectionId estiver presente, busca APENAS aquela seção
          const singleSection = await PublicSurveyService.getSingleSurveySection(companyId, language, sectionId);
          data = [singleSection]; // coloca a única seção em um array para o map funcionar
        } else {
          // caso contrário, busca TODAS as seções (comportamento original)
          data = await PublicSurveyService.getSurveyQuestions(companyId, language);
        }
        setSurveyStructure(data);

        // inicializa o estado de respostas e de 'denyUse' com base na estrutura carregada
        const initialAnswers = {};
        const initialDenied = {};
        data.forEach(section => {
          section.questions.forEach(question => {
            initialAnswers[question.id] = '';
          });
          if (section.denyUse) {
            initialDenied[section.id] = false;
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
  }, [companyId, language, sectionId]); // sectionId agora é uma dependência

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

    if (isChecked) {
      const sectionQuestions = surveyStructure.find(s => s.id === sectionId)?.questions;
      if (sectionQuestions) {
        setAnswers(prevAnswers => {
          const newAnswers = { ...prevAnswers };
          sectionQuestions.forEach(q => {
            newAnswers[q.id] = '';
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

    for (const section of surveyStructure) {
      const sectionDenied = deniedServices[section.id];
      for (const question of section.questions) {
        // validação de pergunta obrigatória (necessita que o backend envie 'mandatory' no PublicQuestionDto)
        // se 'mandatory' não for retornado pela API pública, a validação de obrigatoriedade será apenas no backend.
        // mandatory' está disponível no objeto 'question'.
        const isMandatory = question.mandatory; // API pública retorna este campo

        if (isMandatory && !sectionDenied && (!answers[question.id] || answers[question.id].trim() === '')) {
          setError(`Please answer the mandatory question: "${question.label}" in section "${section.name}".`);
          isValid = false;
          break;
        }

        submittedAnswers.push({
          questionId: question.id,
          surveySectionId: section.id,
          answerValue: sectionDenied ? '' : answers[question.id] || '',
          didNotUseService: sectionDenied,
        });
      }
      if (!isValid) break;
    }

    if (!isValid) return;

    const surveyData = {
      companyId: parseInt(companyId),
      language: language,
      guestIdentifier: guestIdentifier,
      freeTextFeedback: freeTextFeedback,
      answers: submittedAnswers,
    };

    try {
      await PublicSurveyService.submitSurveyResponse(surveyData);
      setSubmissionStatus('success');
      setAnswers({});
      setFreeTextFeedback('');
      setGuestIdentifier('');
      setDeniedServices({});
    } catch (err) {
      setSubmissionStatus('error');
      setError(err.response?.data?.message || err.message || 'Failed to submit survey.');
    }
  };

  if (loading) return <p className="text-center my-5">Loading survey...</p>;
  if (error && !submissionStatus) return <p className="alert alert-danger text-center">Error: {error}</p>;

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
                    question={question}
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