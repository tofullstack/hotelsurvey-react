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
  Pagination, // Componente de paginação
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UserService from '../services/user.service';
import UserForm from '../components/UserForm';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';

const UserManagementPage = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState(null);

  // Estados de paginação (agora com o mesmo padrão do seu código de empresas)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

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
      fetchUsers(); 
    } catch (err) {
      setError(err.response?.data?.message || t('failToDeactivateUser'));
    } finally {
      handleCloseDeactivateModal();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Passamos a página e o tamanho para a sua API, seguindo o seu padrão
      const data = await UserService.getUsers({
        page,
        size: rowsPerPage,
      });

      // Verificamos a estrutura da resposta do backend
      if (data && Array.isArray(data.content)) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
      } else {
        // Fallback em caso de retorno inesperado, como no seu código
        if (Array.isArray(data)) {
           setUsers(data);
           setTotalPages(1); // Se a API retorna um array simples, há apenas uma página
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
    // Ajusta a página para começar em 0
    setPage(newPage - 1);
  };

  // O useEffect agora depende da página e do tamanho da página
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
        alert(t('userUpdatedSuccessfully'));
      } else {
        await UserService.createUser(userData);
        alert(t('userCreatedSuccessfully'));
      }
      handleCloseModal();
      fetchUsers(); 
    } catch (err) {
      setError(err.response?.data?.message || t('failToSaveUser'));
      console.error(err);
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/admin">
          {t("breadcrumb_home")}
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
                <TableCell sx={{ fontWeight: 'bold' }}>{t('userId')}</TableCell>
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
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.login}</TableCell>
                    <TableCell>{user.profile}</TableCell>
                    <TableCell>{user.companyName || t('notApplicable')}</TableCell>
                    <TableCell>
                      <span style={{ color: user.active ? 'green' : 'red' }}>
                        {user.active ? t('active') : t('inactive')}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {user.active ? (
                          <Button onClick={() => handleOpenDeactivateModal(user)} variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}>
                            {t('deactivate')}
                          </Button>
                        ) : (
                          <Button onClick={() => handleActivate(user.id)} variant="outlined" color="success" size="small" startIcon={<PlayArrowIcon />}>
                            {t('activate')}
                          </Button>
                        )}
                        <Button onClick={() => handleOpenModal(user)} variant="outlined" size="small" startIcon={<EditIcon />}>
                        {t('edit')}
                      </Button>
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