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
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from "react-i18next";
import LanguageActionButtons from '../components/LanguageBottomNavigation';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
              <LockOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
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
                autoComplete="login"
                autoFocus
                value={login}
                onChange={(e) => setLogin(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t("login_button_submit")}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      <LanguageActionButtons />
    </Box>
  );
};

export default LoginPage;