import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';

const SurveyViewPage = () => {
  const { companyId, language } = useParams(); // obtém os parâmetros da URL

  // Vverifica se companyId e language são válidos antes de renderizar
  if (!companyId || !language) {
    return <div className="alert alert-danger">Invalid survey link. Missing company ID or language.</div>;
  }

  return (
    <div className="survey-view-page">
      {/* você pode adicionar um cabeçalho, logo do hotel ou informações da pesquisa aqui */}
      <h1 className="text-center my-4">Hotel {companyId} Survey</h1>
      <SurveyForm companyId={companyId} language={language} />
    </div>
  );
};

export default SurveyViewPage;