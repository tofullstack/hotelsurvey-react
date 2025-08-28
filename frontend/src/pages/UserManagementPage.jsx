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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  Stack,
  Pagination,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserService from '../services/user.service';
import UserForm from '../components/UserForm';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CheckIcon from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router-dom';



const UserManagementPage = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const open = Boolean(anchorEl);
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
    }, 3000); // 3 segundos
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
      } else {
        if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
        } else {
          setUsers([]);
          setTotalPages(0);
          console.error("API response for users is not a valid array:", data);
        }
      }
    } catch (err) {
      setError(t('failToLoadUsers'));
      console.error(err);
      setUsers([]);
      setTotalPages(0);
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

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        const userToUpdate = {
          profile: userData.profile,
          companyId: userData.companyId,
        };
        await UserService.updateUser(selectedUser.id, userToUpdate);
        showAlert(t('userUpdatedSuccessfully'), 'success');
      } else {
        await UserService.createUser(userData);
        showAlert(t('userCreatedSuccessfully'), 'success');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('failToSaveUser'));
      console.error(err);
      showAlert(err.response?.data?.message || t('failToSaveUser'), 'error');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await UserService.activateUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || t('failToActivateUser'));
      console.error(err);
    }
  };

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
        <Typography color="text.primary">{t("manageUsers")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h1">
            {t("manageUsers")}
          </Typography>
          <Button
            variant="contained"
            color='info'
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            size="small"
          >
            {t('createUser')}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell sx={{ fontWeight: 'bold' }}>{t('userId')}</TableCell> */}
                <TableCell sx={{ fontWeight: 'bold' }}>{t('userLogin')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('userProfile')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('userCompany')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('userStatus')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    {/* <TableCell>{user.id}</TableCell> */}
                    <TableCell>{user.login}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={user.profile === "ADMIN" ? t("menu_item_user_management_admin") : t("menu_item_user_management_user")}
                        color={user.profile === "ADMIN" ? "primary" : "default"}
                        variant="text"
                      />
                    </TableCell>
                    <TableCell>{user.companyName || t('notApplicable')}</TableCell>
                    <TableCell>
                      <Chip size='small'
                        label={user.active ? t('active') : t('inactive')}
                        color={user.active ? 'success' : 'default'}
                        variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          aria-label="more"
                          aria-controls={open ? 'long-menu' : undefined}
                          aria-expanded={open ? 'true' : undefined}
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
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {t('noUsersFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
        >
          {currentUser && (
            [
              <MenuItem key="edit" onClick={() => {
                handleOpenModal(currentUser);
                handleMenuClose();
              }}>
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
                  handleMenuClose();
                }}>
                  {t('activate')}
                </MenuItem>
              )
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

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{selectedUser ? t('editUser') : t('createNewUser')}</DialogTitle>
        <DialogContent>
          <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
        </DialogContent>
      </Dialog>

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