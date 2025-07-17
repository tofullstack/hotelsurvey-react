import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';

const SurveyViewPage = () => {
  const { companyId, language, sectionId } = useParams(); // Agora captura sectionId também

  // sectionId é opcional se você ainda quiser a rota para todas as seções
  if (!companyId || !language) {
    return <div className="alert alert-danger text-center my-5">Invalid survey link. Missing company ID or language.</div>;
  }

  return (
    <div className="survey-view-page">
      <h1 className="text-center my-4">Hotel Survey</h1>
      {/* Passa sectionId para SurveyForm */}
      <SurveyForm companyId={companyId} language={language} sectionId={sectionId} />
    </div>
  );
};

export default SurveyViewPage;