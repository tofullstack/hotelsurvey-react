import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyService from '../services/company.service';
import {
  Container, Box, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert,
  CircularProgress, Pagination, Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 5;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await CompanyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar essa empresa?')) {
      try {
        await CompanyService.deleteCompany(id);
        setCompanies(companies.filter((c) => c.id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao deletar empresa');
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Empresas</Typography>
        <Button component={Link} to="/admin/companies/new" size='small' variant="contained" color="info" startIcon={<AddIcon />}>
          Nova Empresa
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies
              .slice((currentPage - 1) * companiesPerPage, currentPage * companiesPerPage)
              .map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>{company.name}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        component={Link}
                        to={`/admin/companies/edit/${company.id}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<EditIcon />}
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(company.id)}
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                      >
                        Deletar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(companies.length / companiesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default AdminCompaniesPage;
