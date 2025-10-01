import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog, // Mantido apenas para o modal de desativação
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Pagination, 
  Container, 
  Breadcrumbs, 
  Link, 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList'; 
import GetAppIcon from '@mui/icons-material/GetApp'; 
import SearchIcon from '@mui/icons-material/Search'; 
import CheckIcon from '@mui/icons-material/Check';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; 
import UserService from '../services/user.service';

const tableHeaders = [
  { id: 'login', label: 'userLogin' },
  { id: 'profile', label: 'userProfile' },
  { id: 'company', label: 'userCompany' },
  { id: 'status', label: 'userStatus' },
  { id: 'actions', label: 'actions', align: 'right' },
];

const UserManagementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); 

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });


  
  const handleCreateNew = () => {
      navigate('/admin/users/new'); 
  };

  const handleEdit = (user) => {
      navigate(`/admin/users/edit/${user.id}`); 
      handleMenuClose();
  };


  const handleMenuClick = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserId(null);
  };

  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000); 
  };

  const currentUser = users.find(user => user.id === currentUserId);

  const handleOpenDeactivateModal = (user) => {
    setSelectedUserForDeactivate(user);
    setOpenDeactivateModal(true);
  };

  const handleCloseDeactivateModal = () => {
    setSelectedUserForDeactivate(null);
    setOpenDeactivateModal(false);
  };

  const confirmDeactivateUser = async () => {
    if (!selectedUserForDeactivate) return;
    try {
      await UserService.deactivateUser(selectedUserForDeactivate.id);
      showAlert(t('userDeactivatedSuccessfully'), 'success');
      fetchUsers();
    } catch (err) {
      showAlert(err.response?.data?.message || t('failToDeactivateUser'), 'error');
      setError(err.response?.data?.message || t('failToDeactivateUser'));
    } finally {
      handleCloseDeactivateModal();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getUsers({
        page,
        size: rowsPerPage,
      });

      if (data && Array.isArray(data.content)) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements); 
      } else {
        if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setUsers([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    } catch (err) {
      setError(t('failToLoadUsers'));
      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);
  
  const handleActivate = async (userId) => {
    try {
      await UserService.activateUser(userId);
      showAlert(t('userActivatedSuccessfully'), 'success');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('failToActivateUser'));
      showAlert(err.response?.data?.message || t('failToActivateUser'), 'error');
    } finally {
      handleMenuClose();
    }
  };


  // --- Renderização de Status ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;
  }

  // --- Renderização Principal (UI) ---
  return (
    <Container maxWidth="xl" sx={{ my: 4 }}> 

      {/* Alerta de feedback */}
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
      
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">{t("breadcrumb_home")}
        </Link>
        <Typography color="text.primary">{t("manageUsers")}</Typography>
      </Breadcrumbs>
      
      <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}> 
        
        {/* Cabeçalho da Tabela - Título, Opções e Botão */}
        <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {t("manageUsers")}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
             {/* Ícones de Opções (Filtro, Download, Busca) - Placeholders */}
            <IconButton size="small" aria-label="Filtro" sx={{ border: '1px solid #e0e0e0' }}>
              <FilterListIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="Download" sx={{ border: '1px solid #e0e0e0' }}>
              <GetAppIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="Busca" sx={{ border: '1px solid #e0e0e0' }}>
              <SearchIcon fontSize="small" />
            </IconButton>
            
            <Button
              variant="contained"
              color='primary' 
              startIcon={<AddIcon />}
              onClick={handleCreateNew} // Alterado para navegação
              size="medium" 
            >
              {t('createUser')}
            </Button>
          </Stack>
        </Box>

        {/* Tabela de Usuários (conteúdo mantido) */}
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
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                  >
                    <TableCell>{user.login}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.profile === "ADMIN" ? t("menu_item_user_management_admin") : t("menu_item_user_management_user")}
                        color={user.profile === "ADMIN" ? "primary" : "default"}
                        variant="filled" 
                      />
                    </TableCell>
                    <TableCell>{user.companyName || t('notApplicable')}</TableCell>
                    <TableCell>
                      <Chip 
                        size='small'
                        label={user.active ? t('active') : t('inactive')}
                        sx={{
                          backgroundColor: user.active ? '#e8f5e9' : '#f5f5f5', 
                          color: user.active ? '#388e3c' : '#757575',
                          border: 'none', 
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          aria-label="more"
                          aria-controls={openMenu ? 'long-menu' : undefined}
                          aria-expanded={openMenu ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={(e) => handleMenuClick(e, user.id)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {t('noUsersFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação Original (MANTIDA) */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
        
        {/* Menu de Ações (MoreVertIcon) */}
        <Menu
          id="long-menu"
          MenuListProps={{
            'aria-labelledby': 'long-button',
          }}
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
        >
          {currentUser && (
            [
              <MenuItem key="edit" onClick={() => handleEdit(currentUser)}> {/* Alterado para navegação */}
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> {t('edit')}
              </MenuItem>,
              currentUser.active ? (
                <MenuItem key="deactivate" onClick={() => {
                  handleOpenDeactivateModal(currentUser);
                  handleMenuClose();
                }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> {t('deactivate')}
                </MenuItem>
              ) : (
                <MenuItem key="activate" onClick={() => {
                  handleActivate(currentUser.id);
                }}>
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} /> {t('activate')}
                </MenuItem>
              )
            ]
          )}
        </Menu>

      </Paper>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO REMOVIDO DAQUI */}

      <Dialog
        open={openDeactivateModal}
        onClose={handleCloseDeactivateModal}
      >
        <DialogTitle>
          {t('deactivateUser')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmDeactivateUser', { userLogin: selectedUserForDeactivate?.login })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivateModal} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={confirmDeactivateUser} color="error" variant="contained" autoFocus>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;