import React from 'react';

const QuestionComponent = ({ question, value, onChange, isSectionDenied }) => {
  const renderInput = () => {
    // se a seção foi marcada como "não utilizei", não renderiza inputs e força a resposta a ser vazia
    if (isSectionDenied) {
      return null;
    }

    switch (question.questionType) {
      case 'TEXT':
        return <textarea className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      case 'CHOICE':
        const options = question.options ? question.options.split(',').map(opt => opt.trim()) : [];
        return (
          <select className="form-control" value={value || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">Selecione...</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'YES_NO':
        return (
          <div>
            <label>
              <input type="radio" value="true" checked={value === 'true'} onChange={() => onChange('true')} /> Sim
            </label>
            <label className="ml-2">
              <input type="radio" value="false" checked={value === 'false'} onChange={() => onChange('false')} /> Não
            </label>
          </div>
        );
      case 'SCALE':
        return (
          <input
            type="number"
            className="form-control"
            min="1"
            max="5" // ajustar conforme as opções da  escala ou fetch do backend
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return <p>Tipo de pergunta desconhecido.</p>;
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">
        {question.label} {question.mandatory && <span className="text-danger">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default QuestionComponent;