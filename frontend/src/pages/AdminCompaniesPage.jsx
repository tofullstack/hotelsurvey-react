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
  TablePagination,
  Grid
} from "@mui/material";
import Pagination from '@mui/material/Pagination';
import { Edit, Delete, Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const AdminCompaniesPage = () => {
  const navigate = useNavigate();

  
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await CompanyService.getAllCompanies({
        page,
        size: rowsPerPage,
        name: searchName,
      });

      if (Array.isArray(response)) {
        setCompanies(response);
        setTotalElements(response.length);
        setTotalPages(Math.ceil(response.length / rowsPerPage));
      } else {
        setCompanies(response?.content || []);
        setTotalElements(response?.totalElements || 0);
        setTotalPages(response?.totalPages || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      setCompanies([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, rowsPerPage, searchName]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleSearch = () => {
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/admin/companies/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta empresa?")) {
      try {
        await CompanyService.deleteCompany(id);
        fetchCompanies();
      } catch (error) {
        console.error("Erro ao deletar empresa:", error);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Box mb={4}>
        <Typography variant="h6" component="h1" gutterBottom >
        {t("manageCompanies")}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                label="Buscar por nome"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 500 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                size="small"
              >
                Buscar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/admin/companies/new")}
                startIcon={<AddIcon />}
                size="small"
              >
                Nova Empresa
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
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
                      {/* <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell> */}
                      <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Série</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <TableRow key={company.id} hover>
                          {/* <TableCell>{company.id}</TableCell> */}
                          <TableCell>{company.name}</TableCell>
                          <TableCell>{company.serieEmpresa}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(company.id)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              onClick={() => handleDelete(company.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Nenhuma empresa encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>


            </Paper>
          )}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handleChangePage}
              color="primary"
            />
          </Box></Grid>
      </Grid>
    </Container>
  );
};

export default AdminCompaniesPage;