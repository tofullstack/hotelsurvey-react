import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar, 
  Link,  
  Grid,   
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from "react-i18next";
import LanguageActionButtons from '../components/LanguageBottomNavigation';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ login: '', password: '' }); 
  
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLoginChange = (e) => {
    setLogin(e.target.value);
    if (fieldErrors.login) {
      setFieldErrors(prev => ({ ...prev, login: '' }));
    }
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let hasError = false;
    const newFieldErrors = { login: '', password: '' };
    
    const requiredMessage = t('validation_required') || 'Campo obrigatório'; 

    if (!login.trim()) {
      newFieldErrors.login = requiredMessage;
      hasError = true;
    }
    if (!password.trim()) {
      newFieldErrors.password = requiredMessage;
      hasError = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasError) {
      return; 
    }

    setLoading(true);
    try {
      const response = await AuthService.login({ login, password });
      authLogin(response.token); 

      if (response.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login_error_credentials'));
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = !login.trim() || !password.trim() || loading; 

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5', 
      }}
    >
      <Container component="main" maxWidth="xs">
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mb: 2 
              }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}> 
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" mt={1}>
                {t("loginWelcome")}
              </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="login"
                label={t("login_field_login")}
                name="login"
                autoComplete="username"
                autoFocus
                value={login}
                onChange={handleLoginChange} 
                error={!!fieldErrors.login}
                helperText={fieldErrors.login}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("login_field_password")}
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange} 
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isFormInvalid} 
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t("login_button_submit")}
              </Button>
              
              <Grid container>
                <Grid item xs>
                  <Link 
                    href="/forgot-password" 
                    variant="body2" 
                    onClick={(e) => {
                      e.preventDefault(); 
                      navigate('/forgot-password'); 
                    }}>
                      {/* futuro link para recuperação de senha */}
                    {/* {t("login_link_forgot_password") || 'Esqueceu a senha?'} */}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      <LanguageActionButtons />
    </Box>
  );
};

export default LoginPage;