import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyService from '../services/company.service';
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from 'react-router-dom';

import {
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  Paper, 
  Breadcrumbs, 
  Link,
  Grid, 
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t } = useTranslation();

  const [company, setCompany] = useState({ name: '', serieEmpresa: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      CompanyService.getCompanyById(id)
        .then((data) => setCompany(data))
        .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar empresa'));
    }
  }, [id, isEdit]);

  const handleCancel = () => {
    navigate('/admin/companies');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await CompanyService.updateCompany(id, company);
      } else {
        await CompanyService.createCompany(company);
      }
      navigate('/admin/companies'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar empresa');
    }
  };

  return (
    <Container sx={{ mt: 4 }}> 

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, '& .MuiLink-root': { color: 'text.secondary' } }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">
            {t("breadcrumb_home")}
        </Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/companies">
          {t("breadcrumb_companies")}
        </Link>
        <Typography color="text.primary">
          {isEdit ? t("menu_company_form_edit_title") : t("menu_company_form_create_title")}
        </Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEdit ? t("menu_company_form_edit_title") : t("menu_company_form_create_title")}
      </Typography>


      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("menu_company_form_name_placeholder")}
              variant="outlined"
              size='medium' 
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("menu_company_form_series_placeholder")}
              variant="outlined"
              size='medium' 
              value={company.serieEmpresa}
              onChange={(e) => setCompany({ ...company, serieEmpresa: e.target.value })}
              required
            />
          </Grid>


        </Grid>

        <Box 
            sx={{ 
                pt: 4, 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid #e0e0e0' 
            }}
        >
            <Button
              variant="contained"
              sx={{ 
                  backgroundColor: '#343a40', 
                  color: 'white', 
                  '&:hover': { backgroundColor: '#495057' }
              }}
              startIcon={<ArrowBackIcon />}
              size='large'
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>

            <Button 
                type="submit" 
                variant="contained" 
                size='large'
                sx={{ 
                    backgroundColor: '#343a40', 
                    color: 'white', 
                    '&:hover': { backgroundColor: '#495057' }
                }}
            >
             {isEdit ? t("save") : t("menu_company_form_create_button")}
            </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CompanyForm;