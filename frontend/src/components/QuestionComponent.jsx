import React from "react";

const QuestionComponent = ({ question, value, onChange, isSectionDenied }) => {
  if (isSectionDenied) return null;

  const questionType = question.questionType || question.type;

  const renderInput = () => {
    switch (questionType?.toUpperCase()) {
      case 'TEXT':
        return (
          <textarea
            className="form-control"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite sua resposta..."
            rows="3"
          />
        );

      case 'CHOICE': {
        const options = question.options
          ? question.options[0].split('-').map(opt => opt.trim())
          : [];
        return (
          <select
            className="form-select"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Selecione uma opção</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }

      case 'YES_NO':
        return (
          <div className="d-flex gap-4 mt-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id={`yes-${question.id}`}
                value="true"
                checked={value === 'true'}
                onChange={() => onChange('true')}
              />
              <label className="form-check-label" htmlFor={`yes-${question.id}`}>
                Sim
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id={`no-${question.id}`}
                value="false"
                checked={value === 'false'}
                onChange={() => onChange('false')}
              />
              <label className="form-check-label" htmlFor={`no-${question.id}`}>
                Não
              </label>
            </div>
          </div>
        );

      case 'SCALE': {
        const scaleOptions = question.options
          ? question.options[0].split('-').map(opt => opt.trim())
          : [];

        return (
          <select
            className="form-select"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Selecione uma nota</option>
            {scaleOptions.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }

      default:
        return <p className="text-muted">Tipo de pergunta desconhecido.</p>;
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label" title={question.label}>
        {question.label}
        {question.mandatory && <span className="text-danger ms-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default QuestionComponent;
