
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import CompanyService from '../services/company.service';

const UserForm = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [login, setLogin] = useState(user?.login || '');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(user?.profile || 'USUARIO');
  const [companyId, setCompanyId] = useState(user?.companyId || '');

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await CompanyService.getAllCompanies();

        if (response && response.content) {
          setCompanies(response.content);
        } else {
          setCompanies([]);
        }

      } catch (err) {
        setErrorCompanies(t('failToLoadCompanies'));
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ login, password, profile, companyId });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { my: 1, width: '100%' } }}>
      <TextField
        label={t('userLogin')}
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required
        disabled={!!user}
        size="small"
      />
      {!user && (
        <TextField
          label={t('userPassword')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
        />
      )}
      <FormControl fullWidth sx={{ my: 1 }} size="small">
        <InputLabel>{t('userProfile')}</InputLabel>
        <Select
          value={profile}
          label={t('userProfile')}
          onChange={(e) => setProfile(e.target.value)}
        >
          <MenuItem value="ADMIN">
            {t("menu_item_user_management_admin")}
          </MenuItem>
          <MenuItem value="USUARIO">
            {t("menu_item_user_management_user")}
          </MenuItem>
        </Select>
      </FormControl>

      {loadingCompanies ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : errorCompanies ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 2 }}>
          {errorCompanies}
        </Typography>
      ) : (
        <FormControl fullWidth sx={{ my: 1 }} size="small">
          <InputLabel>{t('userCompany')}</InputLabel>
          <Select
            value={companyId}
            label={t('userCompany')}
            onChange={(e) => setCompanyId(e.target.value)}
            required
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={onCancel} variant="outlined" size="small">
          {t('cancel')}
        </Button>
        <Button type="submit" variant="contained" size="small">
          {t('save')}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;