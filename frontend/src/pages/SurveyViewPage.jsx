import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyForm from '../components/SurveyForm';
import { Container, Box, Typography, Paper, Alert } from '@mui/material';

const SurveyViewPage = () => {
  const { formId, language } = useParams(); 

  if (!formId) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" variant="filled">
          <Typography variant="h6">Erro de Acesso</Typography>
          <Typography>O link do formulário é inválido ou incompleto. ID do Formulário não encontrado.</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start', 
        justifyContent: 'center',
        padding: { xs: 2, md: 5 },
        backgroundColor: (theme) => theme.palette.grey[100], 
      }}
    >
      <Paper
        elevation={8} 
        sx={{
          maxWidth: 800, 
          width: '100%',
          p: { xs: 2, sm: 4, md: 6 }, 
          borderRadius: 2, 
          mb: 5, 
        }}
      >

        <SurveyForm formId={formId} language={language} />

      </Paper>
    </Box>
  );
};

export default SurveyViewPage;