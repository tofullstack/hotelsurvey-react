import React, { useState, useEffect } from 'react';
import QuestionComponent from './QuestionComponent';
import PublicSurveyService from '../services/public.survey.service';

const SurveyForm = ({ companyId, language }) => {
  const [surveyStructure, setSurveyStructure] = useState([]);
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
        const data = await PublicSurveyService.getSurveyQuestions(companyId, language);
        setSurveyStructure(data);

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
  }, [companyId, language]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
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
        setAnswers(prev => {
          const newAnswers = { ...prev };
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
        const isMandatory = question.mandatory;

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

  if (loading) return <p>Loading survey...</p>;
  if (error && !submissionStatus) return <p className="text-danger">Error: {error}</p>;

  if (submissionStatus === 'success') {
    return (
      <div className="alert alert-success text-center py-5">
        <h3>🎉 Thank you for your feedback!</h3>
        <p>Your response has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="text-center mb-1">Guest Satisfaction Survey</h2>
      <p className="text-center text-muted mb-4">
        Please rate your experience and help us improve our services.
      </p>

      {submissionStatus === 'error' && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="guestIdentifier" className="form-label">
            <i className="bi bi-person-vcard me-2"></i>Your Identifier (optional):
          </label>
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
          <div key={section.id} className="card mb-4 shadow-sm border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{section.icon || '📌'} {section.name}</h5>
              {section.denyUse && (
                <div className="form-check mb-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`denyUseSection-${section.id}`}
                    checked={deniedServices[section.id]}
                    onChange={(e) => handleDenyUseChange(section.id, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`denyUseSection-${section.id}`}>
                    Didn't use this service
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
                <p className="text-muted fst-italic">You marked that you didn’t use this service. No questions will be shown.</p>
              )}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <label htmlFor="freeTextFeedback" className="form-label">
            <i className="bi bi-chat-left-text me-2"></i>Additional Feedback (optional):
          </label>
          <textarea
            className="form-control rounded"
            id="freeTextFeedback"
            rows="4"
            maxLength={500}
            value={freeTextFeedback}
            onChange={(e) => setFreeTextFeedback(e.target.value)}
            placeholder="Share any additional thoughts or suggestions here..."
          ></textarea>
          <small className="text-muted">{freeTextFeedback.length}/500 characters</small>
        </div>

        <button type="submit" className="btn btn-success btn-lg w-100">
          <i className="bi bi-send-fill me-2"></i> Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default SurveyForm;
