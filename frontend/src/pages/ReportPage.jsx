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
  List,
  ListItem,
  ListItemText,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Breadcrumbs,
  Link,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Link as RouterLink } from 'react-router-dom';


const languages = [
  { code: 'en-US', i18nKey: 'english' },
  { code: 'pt-BR', i18nKey: 'portuguese' },
  { code: 'es-ES', i18nKey: 'spanish' },
  { code: 'fr-FR', i18nKey: 'french' },
  { code: 'de-DE', i18nKey: 'german' },
  { code: 'it-IT', i18nKey: 'italian' },
  { code: 'ja-JP', i18nKey: 'japanese' },
  { code: 'ko-KR', i18nKey: 'korean' },
  { code: 'zh-CN', i18nKey: 'chinese' },
];

const ReportPage = () => {
  const { t } = useTranslation();

  const [responses, setResponses] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    serieEmpresa: '',
    language: '',
    startDate: '',
    endDate: ''
  });
  const [open, setOpen] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

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

  const fetchSummaryData = async () => {
    try {
      const summaryData = await ReportService.getReportSummary(filters);
      if (summaryData) {
        setTotalResponses(summaryData.totalResponses);
        setAverageRating(summaryData.averageRating);
      } else {
        setTotalResponses(0);
        setAverageRating(null);
      }
    } catch (err) {
      console.error("Error fetching summary data:", err);
    }
  };


  useEffect(() => {
    fetchPaginatedResponses();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchSummaryData();
  }, [filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(0);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>{t('loadingReports')}</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">{t("breadcrumb_home")}
        </Link>
        <Typography color="text.primary">{t("reportsTitle")}</Typography>
      </Breadcrumbs>

      <Typography variant="h6" component="h1" align="center" mb={4}>
        {t('reportsTitle')}
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h6" mb={3}>{t('filters')}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label={t('companySeries')}
              name="serieEmpresa"
              value={filters.serieEmpresa}
              onChange={handleFilterChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">{t('language')}</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={filters.language}
                label={t('language')}
                onChange={handleFilterChange}
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
            <TextField
              fullWidth
              label={t('startDate')}
              type="datetime-local"
              name="startDate"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label={t('endDate')}
              type="datetime-local"
              name="endDate"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            <Button size='small' color='info' variant="contained" onClick={applyFilters}>
              {t('applyFilters')}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" mb={2}>{t('reportSummary')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body1">
                  {t('totalResponses')}: <strong>{totalResponses}</strong>
                </Typography>
              </Paper>
            </Grid>
            {averageRating !== null && (
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body1">
                    {t('averageRating')}: <strong>{averageRating.toFixed(2)}</strong>
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button size='small' variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => handleDownload('pdf')}>
            {t('downloadPDF')}
          </Button>
          <Button size='small' variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => handleDownload('xml')}>
            {t('downloadXML')}
          </Button>
        </Stack>
      </Box>

      {Array.isArray(responses) && responses.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>{t('id')}</TableCell>
                <TableCell>{t('company')}</TableCell>
                <TableCell>{t('language')}</TableCell>
                <TableCell>{t('responseDate')}</TableCell>
                <TableCell>{t('guestId')}</TableCell>
                <TableCell>{t('feedback')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map(response => (
                <React.Fragment key={response.id}>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(prev => ({ ...prev, [response.id]: !prev[response.id] }))}
                      >
                        {open[response.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{response.id}</TableCell>
                    <TableCell>{response.companyName}</TableCell>
                    <TableCell>{response.language}</TableCell>
                    <TableCell>{new Date(response.responseDate).toLocaleString()}</TableCell>
                    <TableCell>{response.guestIdentifier || t('notApplicable')}</TableCell>
                    <TableCell>{response.freeTextFeedback ? `${response.freeTextFeedback.substring(0, 50)}...` : t('notApplicable')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={open[response.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {t('answersForId', { id: response.id })}
                          </Typography>
                          <Grid container spacing={2}>
                            {response.answers.map(answer => (
                              <Grid item xs={12} sm={6} md={4} key={answer.answerId}>
                                <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                            <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
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
        <Typography variant="body1" align="center" color="text.secondary">
          {t('noResponsesFound')}
        </Typography>
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