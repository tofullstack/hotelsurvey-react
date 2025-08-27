import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import PreviewModal from '../components/PreviewModal';
import { useTranslation, Trans } from "react-i18next";
import DeleteIcon from '@mui/icons-material/Delete';

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
  Stack,
  Breadcrumbs,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

const AdminFormsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const languages = ["pt", "en", "es"];

  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  // Dois estados para os filtros
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

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

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedFormForDeactivate, setSelectedFormForDeactivate] = useState(null);

  const handleOpenDeactivateModal = (form) => {
    setSelectedFormForDeactivate(form);
    setOpenDeactivateModal(true);
  };

  const handleCloseDeactivateModal = () => {
    setSelectedFormForDeactivate(null);
    setOpenDeactivateModal(false);
  };

  const confirmDeactivate = async () => {
    if (!selectedFormForDeactivate) return;
    try {
      await FormService.deactivateForm(selectedFormForDeactivate.id);
      setForms(forms.map(f =>
        f.id === selectedFormForDeactivate.id ? { ...f, active: false } : f
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao desativar formulário.');
    } finally {
      handleCloseDeactivateModal();
    }
  };

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
  
  const fetchForms = async (currentStatusFilter, currentTypeFilter) => {
    let conditionalFilter = null;
    if (currentTypeFilter === 'normais') {
        conditionalFilter = false;
    } else if (currentTypeFilter === 'condicionais') {
        conditionalFilter = true;
    }

    try {
      const data = await FormService.searchForms(null, currentStatusFilter, conditionalFilter);
      setForms(data);
      setLoading(false);
      setCurrentPage(1); // Resetar para a primeira página ao mudar o filtro
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load forms.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(statusFilter, typeFilter);
  }, [statusFilter, typeFilter]);

  const handleGenerateQr = (form) => {
    setSelectedFormForQr(form);
  };

  const getSurveyFrontendUrl = (form) => {
    const languageCode = form.language || 'pt-BR';
    return `http://localhost:5173/survey/${form.id}/${languageCode}`;
  };

  const handleActivate = async (formId) => {
    try {
      await FormService.activateForm(formId);
      setForms(forms.map(f => f.id === formId ? { ...f, active: true } : f));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao ativar formulário.');
    }
  };

  // State e handlers para o menu de ações de cada linha
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFormId, setCurrentFormId] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event, formId) => {
    setAnchorEl(event.currentTarget);
    setCurrentFormId(formId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentFormId(null);
  };

  // Encontrar o formulário selecionado pelo menu
  const currentForm = forms.find(form => form.id === currentFormId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ color: 'text.primary' }} href="/admin">
          {t("breadcrumb_home")}
        </Link>
        <Typography color="text.primary">{t("formsTitle")}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6">{t("formsTitle")}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Seletor de Status (Ativo/Inativo) */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t("filterStatus")}</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label={t("filterStatus")}
              size="small"
            >
              <MenuItem value="todos">{t("allStatus")}</MenuItem>
              <MenuItem value="ativos">{t("activeStatus")}</MenuItem>
              <MenuItem value="inativos">{t("inactiveStatus")}</MenuItem>
            </Select>
          </FormControl>

          {/* Seletor de Tipo (Normal/Condicional) */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t("filterType")}</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label={t("filterType")}
              size="small"
            >
              <MenuItem value="todos">{t("allTypes")}</MenuItem>
              <MenuItem value="normais">{t("normalForms")}</MenuItem>
              <MenuItem value="condicionais">{t("conditionalForms")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            component={Link}
            to="/admin/forms/new"
            variant="contained"
            color="info"
            size="small"
            startIcon={<AddIcon />}
          >
            {t("newForm")}
          </Button>

          {/* botão para mudar idioma */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const currentIndex = languages.indexOf(i18n.language);
              const nextIndex = (currentIndex + 1) % languages.length;
              i18n.changeLanguage(languages[nextIndex]);
            }}
          >
            {i18n.language.toUpperCase()}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("company")}</TableCell>
              <TableCell>{t("language")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
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
                    <Chip  size="small"
                      label={form.active ? t("active") : t("inactive")}
                      color={form.active ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip  size="small"
                      label={form.conditional ? t("conditionalForm") : t("normalForm")}
                      color={form.conditional ? "warning" : "default"}
                      variant="text"
                    />
                  </TableCell>
                  <TableCell align="right" >
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={(e) => handleMenuClick(e, form.id)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
          },
        }}
      >
        {currentForm && (
          [
            <MenuItem key="edit" onClick={() => {
              navigate(`/admin/forms/edit/${currentForm.id}`);
              handleMenuClose();
            }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> {t("edit")}
            </MenuItem>,
            <MenuItem key="preview" onClick={() => {
              handleOpenPreviewModal(currentForm.id);
              handleMenuClose();
            }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> {t("preview")}
            </MenuItem>,
            <MenuItem key="qr" onClick={() => {
              handleGenerateQr(currentForm);
              handleOpenModal();
              handleMenuClose();
            }}>
              <QrCodeIcon fontSize="small" sx={{ mr: 1 }} /> {t("qrcode")}
            </MenuItem>,
            currentForm.active ? (
              <MenuItem key="deactivate" onClick={() => {
                handleOpenDeactivateModal(currentForm);
                handleMenuClose();
              }}>
                <DeleteIcon fontSize="small" sx={{mr:1}}/> {t("deactivate")}
              </MenuItem>
            ) : (
              <MenuItem key="activate" onClick={() => {
                handleActivate(currentForm.id);
                handleMenuClose();
              }}>
                {t("activate")}
              </MenuItem>
            ),
          ]
        )}
      </Menu>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(forms.length / formsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Modal
        open={openDeactivateModal}
        onClose={handleCloseDeactivateModal}
        aria-labelledby="modal-deactivate-title"
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
            width: 400,
            textAlign: 'center',
          }}
        >
          <Typography id="modal-deactivate-title" variant="h6" mb={2}>
            {t("deactivateConfirmationTitle")}
          </Typography>
          <Typography mb={3}>
            <Trans
              i18nKey="deactivateConfirmation"
              values={{ formName: selectedFormForDeactivate?.name }}
              components={{ strong: <strong /> }}
            />
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button onClick={handleCloseDeactivateModal} variant="outlined">
              {t("cancel")}
            </Button>
            <Button onClick={confirmDeactivate} variant="contained" color="error">
              {t("confirm")}
            </Button>
          </Stack>
        </Box>
      </Modal>

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
            <Trans
              i18nKey="qrcodeDescription"
              values={{ formName: selectedFormForQr?.name }}
              components={{ strong: <strong /> }}
            />
          </Typography>
          {selectedFormForQr && (
            <QRCodeDisplay url={getSurveyFrontendUrl(selectedFormForQr)} size={256} />
          )}
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="outlined" color="error">
            {t("close")}
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