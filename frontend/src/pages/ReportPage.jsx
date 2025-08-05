import React, { useState, useEffect } from 'react';
import ReportService from '../services/report.service';

const ReportPage = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyId: '',
    companyName: '', 
    language: '',
    startDate: '',
    endDate: ''
  });

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.companyId) params.companyId = filters.companyId;
      if (filters.companyName) params.companyName = filters.companyName; 
      if (filters.language) params.language = filters.language;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await ReportService.getSurveyResponses(params);
      setResponses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchResponses();
  };

  if (loading) return <p className="text-center mt-5">Carregando relatórios...</p>;
  if (error) return <p className="alert alert-danger">Erro: {error}</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Relatórios de Pesquisa</h2>

      <div className="card p-3 mb-4">
        <h5 className="mb-3">Filtros</h5>
        <div className="row g-3">
          {/* <div className="col-md-3">
            <label htmlFor="companyId" className="form-label">ID da Empresa:</label>
            <input
              type="number"
              className="form-control"
              id="companyId"
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
            />
          </div> */}
          {/* novo campo para nome da empresa */}
          <div className="col-md-3">
            <label htmlFor="companyName" className="form-label">Nome da Empresa:</label>
            <input
              type="text"
              className="form-control"
              id="companyName"
              name="companyName"
              value={filters.companyName}
              onChange={handleFilterChange}
              placeholder="Ex: Hotel Alpha"
            />
          </div>
          {/* filtragem pelo nome da empresa*/}
          <div className="col-md-3">
            <label htmlFor="language" className="form-label">Idioma:</label>
            <select
              className="form-select"
              id="language"
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
            >
              <option value="">Selecione o Idioma</option>
              <option value="pt-BR">Português (pt-BR)</option>
              <option value="en">Inglês (en)</option>
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="startDate" className="form-label">Data de Início:</label>
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
            <label htmlFor="endDate" className="form-label">Data de Fim:</label>
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
            <button className="btn btn-primary" onClick={applyFilters}>Aplicar Filtros</button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <p className="text-center text-muted">Nenhuma resposta de pesquisa encontrada para os filtros selecionados.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Idioma</th>
                <th>Data da Resposta</th>
                <th>Hóspede</th>
                <th>Feedback</th>
                <th>Detalhes</th>
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
                      Ver Respostas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* detalhes expansíveis para cada resposta */}
          {responses.map(response => (
            <div className="collapse" id={`collapse${response.id}`} key={`collapse-${response.id}`}>
              <div className="card card-body mb-2">
                <h6>Respostas para o ID da Resposta: {response.id}</h6>
                <ul className="list-group list-group-flush">
                  {response.answers.map(answer => (
                    <li key={answer.answerId} className="list-group-item">
                      <strong>{answer.surveySectionName} - {answer.questionLabel}:</strong> {answer.didNotUseService ? '[Não utilizou o serviço]' : answer.answerValue}
                    </li>
                  ))}
                </ul>
                {response.freeTextFeedback && <p className="mt-2"><strong>Feedback Completo:</strong> {response.freeTextFeedback}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportPage;