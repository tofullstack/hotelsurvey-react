import React, { useState, useEffect } from 'react';
import ReportService from '../services/report.service';

const ReportPage = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyId: '',
    language: '',
    startDate: '',
    endDate: ''
  });

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReportService.getSurveyResponses(filters);
      setResponses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []); // carrega inicialmente ao montar o componente

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchResponses(); // rebusca com os filtros atuais
  };

  if (loading) return <p className="text-center mt-5">Loading reports...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Survey Reports</h2>

      <div className="card p-3 mb-4">
        <h5 className="mb-3">Filters</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label htmlFor="companyId" className="form-label">Company ID:</label>
            <input
              type="number"
              className="form-control"
              id="companyId"
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="language" className="form-label">Language:</label>
            <input
              type="text"
              className="form-control"
              id="language"
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="startDate" className="form-label">Start Date:</label>
            <input
              type="datetime-local"
              className="form-control"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="endDate" className="form-label">End Date:</label>
            <input
              type="datetime-local"
              className="form-control"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-12 mt-3 text-end">
            <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <p className="text-center text-muted">No survey responses found for the selected filters.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Language</th>
                <th>Response Date</th>
                <th>Guest ID</th>
                <th>Feedback</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {responses.map(response => (
                <tr key={response.id}>
                  <td>{response.id}</td>
                  <td>{response.companyName}</td>
                  <td>{response.language}</td>
                  <td>{new Date(response.responseDate).toLocaleString()}</td>
                  <td>{response.guestIdentifier || 'N/A'}</td>
                  <td>{response.freeTextFeedback ? response.freeTextFeedback.substring(0, 50) + '...' : 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${response.id}`}
                      aria-expanded="false"
                      aria-controls={`collapse${response.id}`}
                    >
                      View Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Collapsible details for each response */}
          {responses.map(response => (
            <div className="collapse" id={`collapse${response.id}`} key={`collapse-${response.id}`}>
              <div className="card card-body mb-2">
                <h6>Answers for Response ID: {response.id}</h6>
                <ul className="list-group list-group-flush">
                  {response.answers.map(answer => (
                    <li key={answer.answerId} className="list-group-item">
                      <strong>{answer.surveySectionName} - {answer.questionLabel}:</strong> {answer.didNotUseService ? '[Did not use service]' : answer.answerValue}
                    </li>
                  ))}
                </ul>
                {response.freeTextFeedback && <p className="mt-2"><strong>Full Feedback:</strong> {response.freeTextFeedback}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportPage;