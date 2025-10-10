import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import CompanyService from '../services/company.service';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

import {
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  Breadcrumbs, 
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid 
} from '@mui/material';


const UserCreateEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { t } = useTranslation();

  const [initialLoading, setInitialLoading] = useState(true);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('USUARIO');
  const [companyId, setCompanyId] = useState('');

  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchDependencies = async () => {
      let fetchedUser = null;
      let companySuccess = true;
      
      try {
        const companyResponse = await CompanyService.getAllCompanies({ size: 1000 });
        setCompanies(companyResponse.content || []);
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
        setError(t('failToLoadCompanies'));
        companySuccess = false;
      }
      
      if (isEdit) {
        try {
          fetchedUser = await UserService.getUserById(id);
          setLogin(fetchedUser.login || '');
          setProfile(fetchedUser.profile || 'USUARIO');
          setCompanyId(fetchedUser.companyId || '');
        } catch (err) {
          console.error(`Erro ao carregar usuário com ID ${id}:`, err);
          setError(err.response?.data?.message || t('failToLoadUserById')); 
        }
      }

      if (!companySuccess && !isEdit) {
         setInitialLoading(false);
         return;
      }

      setInitialLoading(false);
    };
    
    fetchDependencies();
  }, [id, isEdit, t]);

  const handleCancel = () => {
    navigate('/admin/users');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const userData = { login, password, profile, companyId: companyId || null };

    try {
      if (isEdit) {
        const updateData = { profile: userData.profile, companyId: userData.companyId };
        await UserService.updateUser(id, updateData);
      } else {
        await UserService.createUser(userData);
      }
      navigate('/admin/users'); 
    } catch (err) {
      setError(err.response?.data?.message || t('failToSaveUser'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );
  }

  const title = isEdit ? t('menu_user_form_edit_title') : t('menu_user_form_create_title');

  return (
    <Container sx={{ mt: 4 }}> 

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, '& .MuiLink-root': { color: 'text.secondary' } }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">
            {t("breadcrumb_home")}
        </Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/users">
          {t("manageUsers")}
        </Link>
        <Typography color="text.primary">
          {title}
        </Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {title}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('userLogin')}
              variant="outlined"
              size='medium' 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={isEdit} 
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            {!isEdit ? (
                <TextField
                  fullWidth
                  label={t('userPassword')}
                  type="password"
                  variant="outlined"
                  size='medium' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
            ) : (
                <Box sx={{ height: 56 }} /> 
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel>{t('userProfile')}</InputLabel>
                <Select
                  value={profile}
                  label={t('userProfile')}
                  onChange={(e) => setProfile(e.target.value)}
                  required
                >
                  <MenuItem value="ADMIN">{t("menu_item_user_management_admin")}</MenuItem>
                  <MenuItem value="USUARIO">{t("menu_item_user_management_user")}</MenuItem>
                </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            {companies.length === 0 && !error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 56 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <FormControl fullWidth variant="outlined" size="medium">
                    <InputLabel>{t('userCompany')}</InputLabel>
                    <Select
                      value={companyId}
                      label={t('userCompany')}
                      onChange={(e) => setCompanyId(e.target.value)}
                    >
                      <MenuItem value="">
                          <em>{t('notApplicable')}</em>
                      </MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                </FormControl>
            )}
          </Grid>
        </Grid>

        <Box 
            sx={{ 
                pt: 4, 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid #e0e0e0' 
            }}
        >
            <Button
              variant="contained"
              color='primary'
              // sx={{ 
              //     backgroundColor: '#343a40', 
              //     color: 'white', 
              //     '&:hover': { backgroundColor: '#495057' }
              // }}
              startIcon={<ArrowBackIcon />}
              size='large'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>

            <Button 
                type="submit" 
                variant="contained" 
                size='large'
                color='primary'
                // sx={{ 
                //     backgroundColor: '#343a40', 
                //     color: 'white', 
                //     '&:hover': { backgroundColor: '#495057' }
                // }}
                disabled={isSubmitting}
            >
             {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEdit ? t("save") : t("createUser"))}
            </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UserCreateEditPage;
