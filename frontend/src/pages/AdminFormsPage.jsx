import React, { useState, useEffect } from 'react';
import FormService from '../services/form.service';
import LanguageBottomNavigation from '../components/LanguageBottomNavigation';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import PreviewModal from '../components/PreviewModal';
import { useTranslation, Trans } from "react-i18next";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';

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
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const tableHeaders = [
  { id: 'name', label: 'name' },
  { id: 'company', label: 'company' },
  { id: 'language', label: 'language' },
  { id: 'status', label: 'status' },
  { id: 'type', label: 'type' },
  { id: 'actions', label: 'actions', align: 'right' },
];


const AdminFormsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [selectedFormForQr, setSelectedFormForQr] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const [filterConditions, setFilterConditions] = useState({
    column: 'name',
    operator: 'contains',
    value: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 10;

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedFormForDeactivate, setSelectedFormForDeactivate] = useState(null);

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const openFilterMenu = Boolean(anchorElFilter);

  const [anchorElAdvancedFilter, setAnchorElAdvancedFilter] = useState(null);
  const openAdvancedFilterMenu = Boolean(anchorElAdvancedFilter);

  const handleResetFilters = () => {
    setStatusFilter('todos');
    setTypeFilter('todos');

    setFilterConditions({
      column: 'name',
      operator: 'contains',
      value: '',
    });

    handleFilterMenuClose();
    handleCloseAdvancedFilterMenu();


    fetchForms('todos', 'todos');
  };

  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000);
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
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const { column, value } = filterConditions;
    const searchValue = value ? value.trim() : '';

    try {
      let data;

      if (searchValue && column === 'serieEmpresa') {
        data = await FormService.getFormsByCompanySerie(searchValue);
      } else {
        let conditionalFilter = null;
        if (currentTypeFilter === 'normais') {
          conditionalFilter = false;
        } else if (currentTypeFilter === 'condicionais') {
          conditionalFilter = true;
        }

        const searchName = column === 'name' ? searchValue : '';

        data = await FormService.searchForms(searchName, currentStatusFilter, conditionalFilter);
      }

      setForms(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || t('failToLoadForms'));
      setLoading(false);
    }
  };

  const handleOpenAdvancedFilterMenu = (event) => {
    setAnchorElAdvancedFilter(event.currentTarget);
  };

  const handleCloseAdvancedFilterMenu = () => {
    setAnchorElAdvancedFilter(null);
  };

  const handleFilterChange = (field, value) => {
    setFilterConditions(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyAdvancedFilter = () => {
    fetchForms(statusFilter, typeFilter);
    handleCloseAdvancedFilterMenu();
  };


  const handleMenuClick = (event, form) => {
    setAnchorEl(event.currentTarget);
    setCurrentForm(form);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentForm(null);
  };

  const handleFilterMenuClick = (event) => {
    setAnchorElFilter(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setAnchorElFilter(null);
  };

  const handleApplyFilters = () => {
    fetchForms(statusFilter, typeFilter);
    handleFilterMenuClose();
  };


  useEffect(() => {
    fetchForms(statusFilter, typeFilter);
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const showNoFormsMessage = !loading && !error && forms.length === 0;

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

      <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>

        <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {t("formsTitle")}
          </Typography>
          <Button
            component={RouterLink}
            to="/admin/forms/new"
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<AddIcon />}
          >
            {t("newForm")}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}
        >
          <IconButton
            size="small"
            aria-label="Reset Filters"
            onClick={handleResetFilters} 
            sx={{ border: '1px solid #e0e0e0' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Filter"
            onClick={handleFilterMenuClick}
            sx={{ border: '1px solid #e0e0e0' }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>


          <IconButton
            size="small"
            aria-label="Advanced Search"
            onClick={handleOpenAdvancedFilterMenu}
            sx={{
              border: '1px solid #e0e0e0',
              backgroundColor: filterConditions.value ? '#e8f5e9' : 'transparent'
            }}
          >
            <SearchIcon fontSize="small" color={filterConditions.value ? 'primary' : 'inherit'} />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorElAdvancedFilter}
          open={openAdvancedFilterMenu}
          onClose={handleCloseAdvancedFilterMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 580,
              p: 2,
            }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl variant="outlined" size="small" sx={{ minWidth: 220 }}>
              <InputLabel>{t("filter_column") || "Coluna"}</InputLabel>
              <Select
                label={t("filter_column") || "Coluna"}
                size='small'
                value={filterConditions.column}
                onChange={(e) => handleFilterChange('column', e.target.value)}
              >
                <MenuItem value="name">{t("column_name") || "Nome"}</MenuItem>
                <MenuItem value="serieEmpresa">{t("column_company_serie") || "Série Empresa"}</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t("filter_operator") || "Operador"}</InputLabel>
              <Select
                label={t("filter_operator") || "Operador"}
                value={filterConditions.operator}
                onChange={(e) => handleFilterChange('operator', e.target.value)}
              >
                <MenuItem value="contains">{t("operator_contains") || "contém"}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t("filter_value") || "Valor"}
              variant="outlined"
              size="small"
              value={filterConditions.value}
              onChange={(e) => handleFilterChange('value', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyAdvancedFilter();
              }}
              fullWidth
            />
          </Stack>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleApplyAdvancedFilter}
              variant="contained"
              size="small"
              disabled={!filterConditions.value && filterConditions.value !== ''}
            >
              {t("apply_filter")}
            </Button>
          </Box>
        </Menu>


        <Menu
          anchorEl={anchorElFilter}
          open={openFilterMenu}
          onClose={handleFilterMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              minWidth: 200,
              p: 2
            }
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t("filterStatus")}
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t("filterStatus")}</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label={t("filterStatus")}
            >
              <MenuItem value="todos">{t("allStatus")}</MenuItem>
              <MenuItem value="ativos">{t("activeStatus")}</MenuItem>
              <MenuItem value="inativos">{t("inactiveStatus")}</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t("filterType")}
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t("filterType")}</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label={t("filterType")}
            >
              <MenuItem value="todos">{t("allTypes")}</MenuItem>
              <MenuItem value="normais">{t("normalForms")}</MenuItem>
              <MenuItem value="condicionais">{t("conditionalForms")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={handleApplyFilters}
            variant="contained"
            size="small"
            fullWidth
          >
            {t("apply_filter")}
          </Button>
        </Menu>


        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell
                    key={header.id}
                    align={header.align || 'left'}
                    sx={{ color: 'text.secondary', borderBottom: '1px solid #e0e0e0' }}
                  >
                    {t(header.label)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {forms
                .slice((currentPage - 1) * formsPerPage, currentPage * formsPerPage)
                .map((form) => (
                  <TableRow key={form.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{form.name}</TableCell>
                    <TableCell>{form.companyName}</TableCell>
                    <TableCell>{form.language || 'pt-BR'}</TableCell>
                    <TableCell>
                      <Chip size="small"
                        label={form.active ? t("activeStatus") : t("inactiveStatus")}
                        sx={{
                          backgroundColor: form.active ? '#e8f5e9' : '#f5f5f5',
                          color: form.active ? '#388e3c' : '#757575',
                          border: 'none',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="small"
                        label={form.conditional ? t("conditionalForm") : t("normalForm")}
                        variant="filled"
                        color={form.conditional ? "warning" : "default"}
                      />
                    </TableCell>

                    <TableCell align="right" >
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">

                        <IconButton
                          aria-label="more"
                          id={`long-button-${form.id}`}
                          aria-controls={openMenu && currentForm?.id === form.id ? 'long-menu' : undefined}
                          aria-expanded={openMenu && currentForm?.id === form.id ? 'true' : undefined}
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
              {showNoFormsMessage && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {t("noFormsFound") || "Nenhum formulário encontrado com os filtros aplicados."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
        open={openMenu}
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
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> {t("deactivate")}
              </MenuItem>
            ) : (
              <MenuItem key="activate" onClick={() => {
                handleActivate(currentForm.id);
                handleMenuClose();
              }}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} /> {t("activate")}
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