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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  Chip,
  Menu,
  Alert,
  Collapse,
  Stack, 
  InputAdornment, 
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { 
    Edit, 
    Search as SearchIcon, 
    Add as AddIcon, 
    Delete, 
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon // 💡 Importado para o botão de Rollback
} from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList"; 
import GetAppIcon from "@mui/icons-material/GetApp";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';


const tableHeaders = [
    { id: 'name', label: 'menu_company_name' },
    { id: 'series', label: 'menu_company_series' },
    { id: 'status', label: 'menu_company_status' },
    { id: 'actions', label: 'menu_company_actions', align: 'right' },
];


const AdminCompaniesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); 

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [status, setStatus] = useState("all"); 
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10); 
  const [totalPages, setTotalPages] = useState(0);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const openFilterMenu = Boolean(anchorElFilter);
  
  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000); 
  };

  const handleMenuClick = (event, companyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentCompanyId(companyId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCompanyId(null);
  };

  const handleFilterMenuClick = (event) => {
    setAnchorElFilter(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setAnchorElFilter(null);
  };

  const currentCompany = companies.find(company => company.id === currentCompanyId);

  const fetchCompanies = async (
    currentPage = page, 
    currentSearchName = searchName, 
    currentStatus = status
  ) => {
    setLoading(true);
    try {
      const response = await CompanyService.getAllCompanies({
        page: currentPage,
        size: rowsPerPage,
        name: currentSearchName,
        status: currentStatus === 'all' ? undefined : currentStatus, 
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
  }, [page, rowsPerPage]); 

  // Função ajustada para garantir que a busca use o estado atual ou resetado
  const handleSearch = () => {
      setPage(0); // Volta para a primeira página ao aplicar busca
      fetchCompanies(0, searchName, status);
  };

  const handleApplyFilters = () => {
      setPage(0); // Volta para a primeira página ao aplicar filtros
      handleFilterMenuClose();
      fetchCompanies(0, searchName, status);
  };

  // 💡 FUNÇÃO PARA LIMPAR TODOS OS FILTROS
  const handleResetFilters = () => {
    // 1. Resetar os estados para o valor inicial
    setSearchName("");
    setStatus("all");

    // 2. Voltar para a primeira página e fechar o menu
    setPage(0);
    if (openFilterMenu) handleFilterMenuClose();
    
    // 3. Chamar a busca com os valores resetados
    fetchCompanies(0, "", "all"); 
  };
  // FIM: FUNÇÃO PARA LIMPAR TODOS OS FILTROS


  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSearchNameChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleChangePage = (event, newPage) => setPage(newPage - 1);
  

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
        handleMenuClose();
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
      
      <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        
        <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {t("manageCompanies")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="medium"
            onClick={() => navigate("/admin/companies/new")}
          >
           { t("menu_company_create_new")}
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
            {/* 💡 NOVO: Botão de Rollback/Reset */}
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

            
            <TextField
                placeholder={t("menu_company_search_placeholder")}
                value={searchName}
                onChange={handleSearchNameChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
                variant="outlined"
                size="small"
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        height: 36, 
                        paddingRight: '8px',
                        borderRadius: '4px',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>

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
                    p: 1 
                }
            }}
        >
            <Typography variant="caption" color="text.secondary" sx={{ p: 1 }}>
                {t("filter_by_status")}
            </Typography>
             <Select
                value={status}
                onChange={handleStatusChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                displayEmpty
            >
                <MenuItem value="all">{t("allStatus") || "Todos"}</MenuItem> {/* Adicionado "All" no filtro */}
                <MenuItem value="active">{t("menu_company_active")}</MenuItem>
                <MenuItem value="inactive">{t("menu_company_inactive")}</MenuItem>
            </Select>
            <Button 
                onClick={handleApplyFilters}
                variant="contained" 
                size="small" 
                fullWidth
            >
                {t("apply_filter")}
            </Button>
        </Menu>


        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
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
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <TableRow 
                        key={company.id} 
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                    >
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.serieEmpresa}</TableCell>
                      <TableCell>
                        <Chip size='small'
                            label={company.active ? t("menu_company_active") : t("menu_company_inactive")}
                            sx={{
                                backgroundColor: company.active ? '#e8f5e9' : '#f5f5f5', 
                                color: company.active ? '#388e3c' : '#757575',
                                border: 'none', 
                                fontWeight: 500
                            }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="more"
                          aria-controls={openMenu ? 'company-actions-menu' : undefined}
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
                      <Typography variant="body1" color="text.secondary">
                        {t("menu_company_no_companies")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
                {currentCompany.active 
                    ? <Delete fontSize="small" sx={{ mr: 1 }} /> 
                    : <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                }
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