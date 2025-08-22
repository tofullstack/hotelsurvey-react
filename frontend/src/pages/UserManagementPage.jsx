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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UserService from '../services/user.service';
import UserForm from '../components/UserForm';

const UserManagementPage = () => {
  const { t } = useTranslation(); 

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState(null);


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
      setUsers(users.map(user =>
        user.id === selectedUserForDeactivate.id ? { ...user, active: false } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || t('failToDeactivateUser'));
    } finally {
      handleCloseDeactivateModal();
    }
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(t('failToLoadUsers'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          {t("manageUsers")}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            {t('createUser')}
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('userId')}</TableCell>
                <TableCell>{t('userLogin')}</TableCell>
                <TableCell>{t('userProfile')}</TableCell>
                <TableCell>{t('userCompany')}</TableCell>
                <TableCell>{t('userStatus')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
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
                    <Button onClick={() => handleOpenModal(user)}><EditIcon /></Button>
                    {user.active ? (
                      <Button onClick={() => handleOpenDeactivateModal(user)} color="error">
                        <DeleteIcon />
                      </Button>
                    ) : (
                      <Button onClick={() => handleActivate(user.id)} color="success">
                        {t('activate')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{selectedUser ? t('editUser') : t('createNewUser')}</DialogTitle>
          <DialogContent>
            <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
          </DialogContent>
        </Dialog>
      </Box>

      <Dialog
        open={openDeactivateModal}
        onClose={handleCloseDeactivateModal}
      >
        <DialogTitle>{t('deactivateUser')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmDeactivateUser', { userLogin: selectedUserForDeactivate?.login })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivateModal}>
            {t('cancel')}
          </Button>
          <Button onClick={confirmDeactivateUser} color="error" variant="contained">
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;