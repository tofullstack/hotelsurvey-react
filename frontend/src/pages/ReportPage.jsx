import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReportService from '../services/report.service';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Breadcrumbs,
  Link,
  Tooltip, 
  InputAdornment, 
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search'; 
import FilterListIcon from '@mui/icons-material/FilterList'; 
import { Link as RouterLink } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh'; 
// imports para o grafico
// import { 
//     BarChart, 
//     Bar, 
//     XAxis, 
//     YAxis, 
//     CartesianGrid, 
//     Tooltip as RechartsTooltip, 
//     ResponsiveContainer 
// } from 'recharts';


const languages = [
  { code: 'pt-BR', i18nKey: 'portuguese' },
  { code: 'en-US', i18nKey: 'english' }, 
  { code: 'es-ES', i18nKey: 'spanish' },
  { code: 'de-DE', i18nKey: 'german' },
  { code: 'fr-FR', i18nKey: 'french' },
  { code: 'it-IT', i18nKey: 'italian' },
  { code: 'ja-JP', i18nKey: 'japanese' },
  { code: 'ko-KR', i18nKey: 'korean' },
  { code: 'zh-CN', i18nKey: 'chinese' },
];

const mockRatingDistribution = [
    { name: '1 Estrela', count: 15 },
    { name: '2 Estrelas', count: 25 },
    { name: '3 Estrelas', count: 40 },
    { name: '4 Estrelas', count: 60 },
    { name: '5 Estrelas', count: 110 },
];


const ReportPage = () => {
  const { t } = useTranslation();

  const [responses, setResponses] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [ratingStandardDeviation, setRatingStandardDeviation] = useState(null);
  const [setRatingDistribution] = useState(mockRatingDistribution);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const initialFilterState = {
    serieEmpresa: '',
    language: '', 
    questionLanguage: '', 
    startDate: '',
    endDate: ''
  };

  const [filterInputs, setFilterInputs] = useState(initialFilterState);
  const [filters, setFilters] = useState(initialFilterState);
  const [open, setOpen] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); 
  const [totalPages, setTotalPages] = useState(0);
  
  const [openAdvancedFilters, setOpenAdvancedFilters] = useState(false);


  const fetchPaginatedResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReportService.getSurveyResponses({
        ...filters,
        page,
        size: rowsPerPage,
      });

      if (data && Array.isArray(data.content)) {
        setResponses(data.content);
        setTotalPages(data.totalPages);
      } else {
        setResponses([]);
        setTotalPages(0);
        console.error("API response for paginated reports is not a valid object:", data);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('failToLoadReports'));
      console.error(err);
      setResponses([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = async (response) => {
    try {
      const data = await ReportService.downloadSingleReport(response.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${response.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || t('failToDownloadReport'));
    }
  };

  const fetchSummaryAndDistribution = async () => {
    try {
      const summaryData = await ReportService.getReportSummary(filters);
      
      if (summaryData) {
        setTotalResponses(summaryData.totalResponses);
        setAverageRating(summaryData.averageRating);
        setRatingStandardDeviation(summaryData.ratingStandardDeviation);
      } else {
        setTotalResponses(0);
        setAverageRating(null);
        setRatingStandardDeviation(null);
      }
      setRatingDistribution(mockRatingDistribution); 

    } catch (err) {
      console.error("Error fetching summary data:", err);
      setRatingDistribution(mockRatingDistribution); 
    }
  };


  useEffect(() => {
    fetchPaginatedResponses();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchSummaryAndDistribution();
  }, [filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    
    setFilterInputs(prev => {
        const newInputs = { ...prev, [name]: value };

        if (name === 'language' || name === 'questionLanguage') {
             setTimeout(() => {
                 setPage(0);
                 setFilters(newInputs); 
             }, 0); 
        }

        return newInputs;
    });
  };

  const applyFilters = () => {
    setPage(0);
    setFilters(filterInputs);
  };
  
  const handleResetFilters = () => {
      setFilterInputs(initialFilterState);
      
      setOpenAdvancedFilters(false);
      
      setPage(0);
      setFilters(initialFilterState); 
  };


  const handleDownload = async (format) => {
    try {
      const data = await ReportService.downloadReport(filters, format);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_pesquisa.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || t('failToDownloadReport'));
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };
  
  const handleRowClick = (responseId) => {
      setOpen(prev => ({ ...prev, [responseId]: !prev[responseId] }));
  }


  if (loading && responses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>{t('loadingReports')}</Typography>
      </Box>
    );
  }

  if (error && responses.length === 0) {
    return <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>;
  }


  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">{t("breadcrumb_home")}
        </Link>
        <Typography color="text.primary">{t("reportsTitle")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        
        <Box mb={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {t('reportsTitle')}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('downloadPDF')}>
              <Button size='medium' variant="contained" color="primary" onClick={() => handleDownload('pdf')}>
                <FileDownloadIcon sx={{ mr: 1 }} /> PDF
              </Button>
            </Tooltip>

          </Stack>
        </Box>
        
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: 1, 
            mb: 3
        }}>
            
            <Tooltip title={t('resetFilters') || "Resetar Filtros"}>
                <IconButton 
                    size="small" 
                    aria-label="Reset Filters" 
                    onClick={handleResetFilters}
                    sx={{ border: '1px solid #e0e0e0' }}
                >
                    <RefreshIcon fontSize="small" /> 
                </IconButton>
          </Tooltip>
           <Tooltip title={t('advancedFilters')}>
            <IconButton
              size="small"
              aria-label="Filter"
              onClick={() => setOpenAdvancedFilters(prev => !prev)}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: openAdvancedFilters ? '#e3f2fd' : 'transparent',
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

            <TextField
                placeholder={t('companySeries')}
                name="serieEmpresa"
                value={filterInputs.serieEmpresa}
                onChange={handleFilterInputChange}
                onKeyDown={handleKeyDown}
                variant="outlined"
                size="small"
                sx={{ 
                    width: '300px',
                    '& .MuiOutlinedInput-root': {
                        height: 36, 
                        paddingRight: '4px',
                        borderRadius: '4px',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />



            <Button 
                size='small' 
                color='primary' 
                variant="contained" 
                onClick={applyFilters}
                startIcon={<SearchIcon />}
            >
                {t('applyFilters')}
            </Button>
        </Box>

        <Collapse in={openAdvancedFilters}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 3, mt: -2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" mb={2}>{t('dateAndLanguageFilters')}</Typography>
                <Grid container spacing={2}>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                        <InputLabel id="language-select-label">{t('responseLanguage')}</InputLabel>
                        <Select
                            labelId="language-select-label"
                            id="language-select"
                            value={filterInputs.language}
                            label={t('responseLanguage')}
                            onChange={handleFilterInputChange}
                            name="language"
                        >
                            <MenuItem value="">
                            <em>{t('none')}</em>
                            </MenuItem>
                            {languages.map((lang) => (
                            <MenuItem key={lang.code} value={lang.code}>
                                {t(lang.i18nKey)}
                            </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                        <InputLabel id="question-language-select-label">{t('questionLanguage')}</InputLabel>
                        <Select
                            labelId="question-language-select-label"
                            id="question-language-select"
                            value={filterInputs.questionLanguage}
                            label={t('questionLanguage')}
                            onChange={handleFilterInputChange}
                            name="questionLanguage"
                        >
                            <MenuItem value="">
                            <em>{t('defaultLanguage')}</em> 
                            </MenuItem>
                            {languages.map((lang) => (
                            <MenuItem key={lang.code} value={lang.code}>
                                {t(lang.i18nKey)}
                            </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                        fullWidth
                        size="small"
                        label={t('startDate')}
                        type="datetime-local"
                        name="startDate"
                        InputLabelProps={{ shrink: true }}
                        value={filterInputs.startDate}
                        onChange={handleFilterInputChange}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                        fullWidth
                        size="small"
                        label={t('endDate')}
                        type="datetime-local"
                        name="endDate"
                        InputLabelProps={{ shrink: true }}
                        value={filterInputs.endDate}
                        onChange={handleFilterInputChange}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Collapse>


        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" mb={2}>{t('reportSummary')}</Typography>
          <Grid container spacing={4}>
            
            <Grid item xs={12} md={5}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={12}>
                      <Paper sx={{ p: 2, border: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
                        <Typography variant="body2" color="text.secondary">{t('totalResponses')}</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {totalResponses}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    {averageRating !== null && (
                      <Grid item xs={12} sm={6} md={12}>
                        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
                          <Typography variant="body2" color="text.secondary">{t('averageRating')}</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {averageRating.toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    
                    {ratingStandardDeviation !== null && (
                      <Grid item xs={12} sm={6} md={12}>
                        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
                          <Typography variant="body2" color="text.secondary">{t('ratingStandardDeviation')}</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {ratingStandardDeviation.toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                </Grid>
            </Grid>
            
            {/*TODO: ideia de onde ficaria o grafico  */}
            {/* <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, border: '1px solid #e0e0e0', bgcolor: 'background.paper', height: 350 }}>
                    <Typography variant="subtitle1" mb={1}>{t('ratingDistribution')}</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={ratingDistribution}
                            margin={{ top: 5, right: 10, left: -20, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                angle={-45} 
                                textAnchor="end" 
                                height={50}
                            />
                            <YAxis 
                                allowDecimals={false}
                                label={{ value: t('totalResponses'), angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip 
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                            />
                            <Bar dataKey="count" fill="#1976d2" name={t('responses')} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid> */}
          </Grid>
        </Box>
      </Paper>

      {error && responses.length > 0 && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}


      {Array.isArray(responses) && responses.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('id')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('company')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('language')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('responseDate')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('guestLastName')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('guestUH')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}>{t('feedback')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map(response => (
                <React.Fragment key={response.id}>
                  <TableRow 
                    hover 
                    onClick={() => handleRowClick(response.id)}
                    sx={{ 
                        '& > *': { borderBottom: 'unset' }, 
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#f5f5f5', 
                        },
                    }}
                  >
                    <TableCell width={30}>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(response.id);
                        }}
                      >
                        {open[response.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{response.id}</TableCell>
                    <TableCell>{response.companyName}</TableCell>
                    <TableCell>{response.language}</TableCell>
                    <TableCell>{new Date(response.responseDate).toLocaleString()}</TableCell>
                    <TableCell>{response.guestLastName || t('notApplicable')}</TableCell>
                    <TableCell>{response.guestUH || t('notApplicable')}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {response.freeTextFeedback ? `${response.freeTextFeedback.substring(0, 50)}...` : t('notApplicable')}
                        </Typography>
                        <Tooltip title={t('downloadSingleReport')}>
                            <IconButton onClick={(e) => { e.stopPropagation(); handleDownloadSingle(response); }} size="small">
                              <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}> 
                      <Collapse in={open[response.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {t('answersForId', { id: response.id })}
                          </Typography>
                          <Grid container spacing={2}>
                            {response.answers.map(answer => (
                              <Grid item xs={12} sm={6} md={4} key={answer.answerId}>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #f0f0f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="subtitle2" color="text.secondary" noWrap>
                                    {answer.surveySectionName}
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                                    {answer.questionLabel}
                                  </Typography>
                                  <Typography variant="body1" sx={{ mt: 1, wordWrap: 'break-word', flexGrow: 1 }}>
                                    {answer.didNotUseService ? t('didNotUseService') : answer.answerValue}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                          {response.freeTextFeedback && (
                            <Paper elevation={0} sx={{ p: 2, mt: 3, border: '1px solid #f0f0f0' }}>
                              <Typography variant="body2" fontWeight="bold">
                                {t('fullFeedback')}:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {response.freeTextFeedback}
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Typography variant="body1" align="center" color="text.secondary">
              {t('noResponsesFound')}
            </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handleChangePage}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default ReportPage;