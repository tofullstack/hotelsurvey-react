import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, QrCode as QrCodeIcon, PlayArrow as PlayArrowIcon, Pause as PauseIcon } from '@mui/icons-material';

const AdminFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await FormService.getAllForms();
        setForms(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load forms.');
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleGenerateQr = (form) => {
    setSelectedFormForQr(form);
  };

  const getSurveyFrontendUrl = (form) => {
       const languageCode = form.language || 'pt-BR'; // Fallback para o idioma
    return `http://localhost:5173/survey/${form.id}/${languageCode}`;
  };

  const handleDeactivate = async (formId) => {
    if (window.confirm("Are you sure you want to deactivate this form?")) {
      try {
        await FormService.deactivateForm(formId);
        setForms(forms.map(f => f.id === formId ? { ...f, active: false } : f));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate form.');
      }
    }
  };

  const handleActivate = async (formId) => {
    try {
      await FormService.activateForm(formId);
      setForms(forms.map(f => f.id === formId ? { ...f, active: true } : f));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate form.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2">Manage Survey Forms</Typography>
        <Button component={Link} to="/admin/forms/new" variant="contained" color="success" startIcon={<AddIcon />}>
          Create New Form
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <List>
        {forms.length === 0 ? (
          <Typography variant="body1" align="center" color="text.secondary">No forms found.</Typography>
        ) : (
          forms.map(form => (
            <Card key={form.id} sx={{ mb: 2, boxShadow: 1 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <ListItemText
                      primary={<Typography variant="h6">{form.name} ({form.language})</Typography>}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Company ID: {form.companyId} | Status: {form.active ? 'Active' : 'Inactive'}
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap', gap: 1 }}>
                    <Button component={Link} to={`/admin/forms/edit/${form.id}`} variant="outlined" color="primary" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button component={Link} to={`/admin/forms/preview/${form.id}`} variant="outlined" color="secondary" startIcon={<VisibilityIcon />}>
                      Preview
                    </Button>
                    {form.active ? (
                      <Button variant="outlined" color="warning" onClick={() => handleDeactivate(form.id)} startIcon={<PauseIcon />}>
                        Deactivate
                      </Button>
                    ) : (
                      <Button variant="outlined" color="success" onClick={() => handleActivate(form.id)} startIcon={<PlayArrowIcon />}>
                        Activate
                      </Button>
                    )}
                    <Button variant="contained" color="info" onClick={() => handleGenerateQr(form)} startIcon={<QrCodeIcon />}>
                      QR Code
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </List>

      {selectedFormForQr && (
        <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: '4px' }}>
          <Typography variant="h6" mb={2}>QR Code for: {selectedFormForQr.name} ({selectedFormForQr.language})</Typography>
          <QRCodeDisplay url={getSurveyFrontendUrl(selectedFormForQr)} size={256} />
        </Box>
      )}
    </Container>
  );
};

export default AdminFormsPage;