import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyService from '../services/company.service';
import { useTranslation, Trans } from "react-i18next";

import {
  Container, Typography, TextField, Button, Box, Alert, Paper, Breadcrumbs, Link
} from '@mui/material';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t, i18n } = useTranslation();

  const [company, setCompany] = useState({ name: '', serieEmpresa: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      CompanyService.getCompanyById(id)
        .then((data) => setCompany(data))
        .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar empresa'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await CompanyService.updateCompany(id, company);
      } else {
        await CompanyService.createCompany(company);
      }
      navigate('/admin/companies'); // volta pra listagem depois de salvar
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar empresa');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/admin">
          {t("breadcrumb_home")}
        </Link>
        <Link underline="hover" color="inherit" href="/admin/companies">
          {t("breadcrumb_companies")}
        </Link>
        <Typography color="text.primary">
          {isEdit ? t("menu_company_form_edit_title") : t("menu_company_form_create_title")}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          {isEdit ? t("menu_company_form_edit_title") : t("menu_company_form_create_title")}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t("menu_company_form_name_placeholder")}
            variant="outlined"
            size='small'
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t("menu_company_form_series_placeholder")}
            variant="outlined"
            size='small'
            value={company.serieEmpresa}
            onChange={(e) => setCompany({ ...company, serieEmpresa: e.target.value })}
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" size='small'>
             {t("save")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size='small'
              onClick={() => navigate('/admin/companies')}
            >
              {t("cancel")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CompanyForm;
