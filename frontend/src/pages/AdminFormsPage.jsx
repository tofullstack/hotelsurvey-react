import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import PreviewModal from '../components/PreviewModal';


import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const AdminFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFormForQr(null);
  };

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 10;

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const handleOpenPreviewModal = (formId) => {
    setSelectedFormId(formId);
    setOpenPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setOpenPreviewModal(false);
    setSelectedFormId(null);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };




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
    const languageCode = form.language || 'pt-BR';
    return `http://localhost:5173/survey/${form.id}/${languageCode}`;
  };

  const handleDeactivate = async (formId) => {
    if (window.confirm("Tem certeza que deseja desativar esse formulário?")) {
      try {
        await FormService.deactivateForm(formId);
        setForms(forms.map(f => f.id === formId ? { ...f, active: false } : f));
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao desativar formulário.');
      }
    }
  };

  const handleActivate = async (formId) => {
    try {
      await FormService.activateForm(formId);
      setForms(forms.map(f => f.id === formId ? { ...f, active: true } : f));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao ativar formulário.');
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
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6">Formulários de Pesquisa</Typography>
        <Button
          component={Link}
          to="/admin/forms/new"
          variant="contained"
          color="info"
          size="small"
          startIcon={<AddIcon />}
        >
          Novo Formulário
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Idioma</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms
              .slice((currentPage - 1) * formsPerPage, currentPage * formsPerPage)
              .map((form) => (
                <TableRow key={form.id} hover>

                  <TableCell>{form.name}</TableCell>
                  <TableCell>{form.companyName}</TableCell>
                  <TableCell>{form.language || 'pt-BR'}</TableCell>
                  <TableCell>
                    <Chip
                      label={form.active ? 'Ativo' : 'Inativo'}
                      color={form.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" >
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        color={form.active ? 'warning' : 'success'}
                        onClick={() =>
                          form.active ? handleDeactivate(form.id) : handleActivate(form.id)
                        }
                        startIcon={form.active ? <PauseIcon /> : <PlayArrowIcon />}
                      >
                        {form.active ? 'Desativar' : 'Ativar'}
                      </Button><Button
                        component={Link}
                        to={`/admin/forms/edit/${form.id}`}
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleOpenPreviewModal(form.id)}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<VisibilityIcon />}
                      >
                        Preview
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        onClick={() => {
                          handleGenerateQr(form);
                          handleOpenModal();
                        }}
                        startIcon={<QrCodeIcon />}
                      >
                        QR Code
                      </Button>

                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(forms.length / formsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>


      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-qr-title"
        aria-describedby="modal-qr-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: 360,
            textAlign: 'center',
          }}
        >
          <Typography id="modal-qr-title" variant="h6" mb={2}>
            QR Code para: {selectedFormForQr?.name}
          </Typography>
          {selectedFormForQr && (
            <QRCodeDisplay url={getSurveyFrontendUrl(selectedFormForQr)} size={256} />
          )}
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="outlined" color="error">
            Fechar
          </Button>
        </Box>
      </Modal>


      <PreviewModal
        open={openPreviewModal}
        handleClose={handleClosePreviewModal}
        formId={selectedFormId}
      />

    </Container>


  );


};

export default AdminFormsPage;
