import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyService from '../services/company.service';
import {
  Container, Typography, TextField, Button, Box, Alert
} from '@mui/material';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [company, setCompany] = useState({ name: '' });
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
      navigate('/admin/companies');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar empresa');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>
        {isEdit ? 'Editar Empresa' : 'Nova Empresa'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nome da Empresa"
          variant="outlined"
          value={company.name}
          onChange={(e) => setCompany({ ...company, name: e.target.value })}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Salvar
        </Button>
      </Box>
    </Container>
  );
};

export default CompanyForm;
