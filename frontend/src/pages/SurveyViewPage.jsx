import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';

const SurveyViewPage = () => {
  const { formId, language } = useParams(); // obtém os parâmetros da URL

  return (
    <div className="survey-view-page">
      {/*adicionar um cabeçalho ou logo do hotel */}
      <SurveyForm formId={formId} language={language} />
    </div>
  );
};

export default SurveyViewPage;