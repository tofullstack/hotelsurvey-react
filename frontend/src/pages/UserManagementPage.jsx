import React, { useState, useEffect } from 'react';
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
      setError(err.response?.data?.message || 'Erro ao desativar usuário.');
    } finally {
      handleCloseDeactivateModal();
      // setSelectedUserForDeactivate(null);
    }

  };


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Falha ao carregar os usuários.');
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
        alert('Usuário atualizado com sucesso!');
      } else {
        await UserService.createUser(userData);
        alert('Usuário criado com sucesso!');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário.');
      console.error(err);
    }
  };

  // const handleDeactivate = async (userId) => {
  //   if (window.confirm('Tem certeza que deseja desativar este usuário?')) {
  //     try {
  //       await UserService.deactivateUser(userId);
  //       alert('Usuário desativado com sucesso!');
  //       fetchUsers();
  //     } catch (err) {
  //       setError(err.response?.data?.message || 'Erro ao desativar usuário.');
  //       console.error(err);
  //     }
  //   }
  // };

  const handleActivate = async (userId) => {
      try {
        await UserService.activateUser(userId);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao ativar usuário.');
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
          Gerenciamento de Usuários
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Criar Usuário
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Login</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.login}</TableCell>
                  <TableCell>{user.profile}</TableCell>
                  <TableCell>{user.companyName || 'N/A'}</TableCell>
                  <TableCell>
                    <span style={{ color: user.active ? 'green' : 'red' }}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <Button onClick={() => handleOpenModal(user)}><EditIcon /></Button>
                    {user.active ? (
                      <Button onClick={() => handleOpenDeactivateModal(user)} color="error">
                        <DeleteIcon />
                      </Button>

                    ) : (
                      <Button onClick={() => handleActivate(user.id)} color="success">Ativar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{selectedUser ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
          <DialogContent>
            <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
          </DialogContent>
        </Dialog>
      </Box>

      <Dialog
        open={openDeactivateModal}
        onClose={handleCloseDeactivateModal}
      >
        <DialogTitle>Desativar Usuário</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja desativar o usuário <strong>{selectedUserForDeactivate?.login}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivateModal}>Cancelar</Button>
          <Button onClick={confirmDeactivateUser} color="error" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default UserManagementPage;