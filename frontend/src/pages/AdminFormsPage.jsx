import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import LanguageBottomNavigation from '../components/LanguageBottomNavigation';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import PreviewModal from '../components/PreviewModal'; // O componente PreviewModal deve ser criado/editado
import { useTranslation, Trans } from "react-i18next";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
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
  Link,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Menu,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';


const AdminFormsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 10;

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedFormForDeactivate, setSelectedFormForDeactivate] = useState(null);

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000); // 3 segundos
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFormForQr(null);
  };

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
      showAlert(t('formDeactivatedSuccessfully'), 'success');
    } catch (err) {
      setError(err.response?.data?.message || t('failToDeactivateForm'));
      showAlert(err.response?.data?.message || t('failToDeactivateForm'), 'error');
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
      setCurrentPage(1);
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
      showAlert(t('formActivatedSuccessfully'), 'success');
    } catch (err) {
      setError(err.response?.data?.message || t('failToActivateForm'));
      showAlert(err.response?.data?.message || t('failToActivateForm'), 'error');
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event, form) => {
    setAnchorEl(event.currentTarget);
    setCurrentForm(form);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentForm(null);
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
      <Collapse in={alertInfo.open}>
        <Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity={alertInfo.severity}
          sx={{ mb: 2 }}
          onClose={() => setAlertInfo({ ...alertInfo, open: false })}
        >
          {alertInfo.message}
        </Alert>
      </Collapse>
      
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">{t("breadcrumb_home")}
        </Link>
        <Typography color="text.primary">{t("formsTitle")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6">{t("formsTitle")}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
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
              component={RouterLink}
              to="/admin/forms/new"
              variant="contained"
              color="info"
              size="small"
              startIcon={<AddIcon />}
            >
              {t("newForm")}
            </Button>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer component={Paper} elevation={0}>
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
                      <Chip size="small"
                        label={form.active ? t("active") : t("inactive")}
                        color={form.active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="small"
                        label={form.conditional ? t("conditionalForm") : t("normalForm")}
                        color={form.conditional ? "warning" : "default"}
                        variant="text"
                      />
                    </TableCell>
                    
                    <TableCell align="right" >
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                        
                        <IconButton
                            aria-label={t("edit")}
                            onClick={() => navigate(`/admin/forms/edit/${form.id}`)}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                            aria-label={t("preview")}
                            onClick={() => handleOpenPreviewModal(form.id)}
                            size="small"
                            color="info" 
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          aria-label="more"
                          id={`long-button-${form.id}`}
                          aria-controls={open && currentForm?.id === form.id ? 'long-menu' : undefined}
                          aria-expanded={open && currentForm?.id === form.id ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={(e) => handleMenuClick(e, form)}
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
      </Paper>

      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': currentForm ? `long-button-${currentForm.id}` : 'long-button-undefined',
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
            // <MenuItem key="edit" onClick={() => {
            //   navigate(`/admin/forms/edit/${currentForm.id}`);
            //   handleMenuClose();
            // }}>
            //   <EditIcon fontSize="small" sx={{ mr: 1 }} /> {t("edit")}
            // </MenuItem>,
            

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
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> {t("deactivate")}
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

      <LanguageBottomNavigation />
    </Container>
  );
};

export default AdminFormsPage;