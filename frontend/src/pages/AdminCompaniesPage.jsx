import React, { useState, useEffect } from "react";
import CompanyService from "../services/company.service";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Menu,
  Alert,
  Collapse
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { Edit, Search as SearchIcon, Add as AddIcon, Delete, MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';


const AdminCompaniesPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // modal de confirmação
  const [openConfirm, setOpenConfirm] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000); // 3 segundos
  };

  const handleMenuClick = (event, companyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentCompanyId(companyId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCompanyId(null);
  };

  const currentCompany = companies.find(company => company.id === currentCompanyId);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await CompanyService.getAllCompanies({
        page,
        size: rowsPerPage,
        name: searchName,
        status,
      });

      setCompanies(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      showAlert(t('failToLoadCompanies'), 'error');
      setCompanies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, rowsPerPage, searchName, status]);

  const handleChangePage = (event, newPage) => setPage(newPage - 1);
  const handleSearch = () => setPage(0);

  const handleEdit = (id) => navigate(`/admin/companies/edit/${id}`);

  const handleToggleStatusClick = (company) => {
    setCompanyToToggle(company);
    setOpenConfirm(true);
  };

  const handleConfirmToggle = async () => {
    if (companyToToggle) {
      try {
        await CompanyService.updateCompanyStatus(companyToToggle.id, !companyToToggle.active);
        showAlert(
          companyToToggle.active ? t('companyDeactivatedSuccessfully') : t('companyActivatedSuccessfully'),
          'success'
        );
        fetchCompanies();
      } catch (error) {
        console.error("Erro ao atualizar status da empresa:", error);
        showAlert(error.response?.data?.message || t('failToUpdateCompanyStatus'), 'error');
      } finally {
        setOpenConfirm(false);
        setCompanyToToggle(null);
      }
    }
  };

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
        <Typography color="text.primary">{t("breadcrumb_companies")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Box mb={2}>
          <Typography variant="h6" component="h1">
            {t("manageCompanies")}
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <TextField
              label={t("menu_company_search_placeholder")}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="active">{t("menu_company_active")}</MenuItem>
                <MenuItem value="inactive">{t("menu_company_inactive")}</MenuItem>
                <MenuItem value="all">{t("menu_company_all")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              size="small"
              color="info"
            >
              {t("menu_company_search")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="info"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate("/admin/companies/new")}
            >
             { t("menu_company_create_new")}
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("menu_company_name")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("menu_company_series")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("menu_company_status")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {t("menu_company_actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <TableRow key={company.id} hover>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.serieEmpresa}</TableCell>
                        <TableCell>
                          <Chip size='small'
                            label={company.active ? t("menu_company_active") : t("menu_company_inactive")}
                            color={company.active ? "success" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="more"
                            aria-controls={openMenu ? 'long-menu' : undefined}
                            aria-expanded={openMenu ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={(e) => handleMenuClick(e, company.id)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {t("menu_company_no_companies")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        <Menu
          id="company-actions-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
        >
          {currentCompany && (
            [
              <MenuItem key="edit" onClick={() => {
                handleEdit(currentCompany.id);
                handleMenuClose();
              }}>
                <Edit fontSize="small" sx={{ mr: 1 }} /> {t('edit')}
              </MenuItem>,
              <MenuItem key="toggle-status" onClick={() => {
                handleToggleStatusClick(currentCompany);
                handleMenuClose();
              }}>
                <Delete fontSize="small" sx={{ mr: 1 }} /> 
                {currentCompany.active ? t('deactivate') : t('activate')}
              </MenuItem>
            ]
          )}
        </Menu>
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Paper>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>
          {companyToToggle?.active ? t("menu_company_toggle_title_modal_deactivate"): t("menu_company_toggle_title_modal_activate")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {companyToToggle?.active
              ? t("menu_company_toggle_active_modal")
              : t("menu_company_toggle_deactive_modal")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleConfirmToggle} 
            color={companyToToggle?.active ? "error" : "primary"} 
            autoFocus
          >
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCompaniesPage;