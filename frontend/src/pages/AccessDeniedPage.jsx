
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); 
  };

  const goToDashboard = () => {
    navigate('/admin'); 
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-danger">403</h1>
        <p className="fs-3">
          <span className="text-danger">Oops!</span> {t("accessDenied")}
        </p>
        <p className="lead">
          {t("accessDeniedMessage")}
        </p>
        <div className="mt-4">
          <button className="btn btn-secondary me-2" onClick={goBack}>
            {t("goback")}
          </button>
          <button className="btn btn-primary" onClick={goToDashboard}>
            {t("goToDashboard")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;