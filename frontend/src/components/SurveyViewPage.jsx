import React from 'react';
import { useParams } from 'react-router-dom';

import SurveyForm from '../components/SurveyForm';

const SurveyViewPage = () => {
  const { companyId, formId } = useParams(); // antes era language

  if (!companyId || !formId) {
    return (
      <div className="alert alert-danger">
        Invalid survey link. Missing company ID or form ID.
      </div>
    );
  }

  return (
    <div className="survey-view-page">
      <h1 className="text-center my-4">Hotel {companyId} Survey</h1>
      <SurveyForm companyId={companyId} formId={formId} />
    </div>
  );
};

export default SurveyViewPage;
