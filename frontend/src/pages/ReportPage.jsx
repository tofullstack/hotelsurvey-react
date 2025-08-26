import React, { useState, useEffect } from 'react';
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
  Stack
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ReportPage = () => {
  const { t } = useTranslation();

  const [reportData, setReportData] = useState({
    totalResponses: 0,
    averageRating: null,
    responses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    serieEmpresa: '',
    language: '',
    startDate: '',
    endDate: ''
  });
  const [open, setOpen] = useState({});

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReportService.getSurveyResponses(filters);
      setReportData(data);
    } catch (err) {
      setError(err.response?.data?.message || t('failToLoadReports'));
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
            <TextField
              fullWidth
              label={t('language')}
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
            />
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
            <Button variant="contained" onClick={applyFilters}>
              {t('applyFilters')}
            </Button>
          </Grid>
        </Grid>
        
        {/* --- Métricas Agregadas Movidas para dentro deste Paper --- */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="h6" mb={2}>{t('reportSummary')}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <Typography variant="body1">
                            {t('totalResponses')}: <strong>{reportData.totalResponses}</strong>
                        </Typography>
                    </Paper>
                </Grid>
                {reportData.averageRating !== null && (
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                            <Typography variant="body1">
                                {t('averageRating')}: <strong>{reportData.averageRating.toFixed(2)}</strong>
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
        {/* -------------------------------------------------------- */}

      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => handleDownload('pdf')}>
            {t('downloadPDF')}
          </Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => handleDownload('xml')}>
            {t('downloadXML')}
          </Button>
        </Stack>
      </Box>
      
      {reportData.responses.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          {t('noResponsesFound')}
        </Typography>
      ) : (
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
              {reportData.responses.map(response => (
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
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            {t('answersForId', { id: response.id })}
                          </Typography>
                          <List disablePadding>
                            {response.answers.map(answer => (
                              <ListItem key={answer.answerId} sx={{ py: 0, px: 2 }}>
                                <ListItemText
                                  primary={<strong>{answer.surveySectionName} - {answer.questionLabel}:</strong>}
                                  secondary={answer.didNotUseService ? t('didNotUseService') : answer.answerValue}
                                />
                              </ListItem>
                            ))}
                          </List>
                          {response.freeTextFeedback && (
                            <Typography variant="body2" sx={{ mt: 2, ml: 2 }}>
                              <strong>{t('fullFeedback')}:</strong> {response.freeTextFeedback}
                            </Typography>
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
      )}
    </Container>
  );
};

export default ReportPage;