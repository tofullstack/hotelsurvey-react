import * as React from 'react';
import { useTranslation } from "react-i18next";
import 'flag-icons/css/flag-icons.min.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const FlagIcon = ({ langCode }) => {
  let flagClass = '';
  switch (langCode) {
    case 'pt-BR':
      flagClass = 'fi fi-br';
      break;
    case 'en':
      flagClass = 'fi fi-gb';
      break;
    case 'es':
      flagClass = 'fi fi-es';
      break;
    default:
      flagClass = 'fi fi-br';
  }
  return <span className={flagClass}></span>;
};

const LanguageActionButtons = () => {
  const { i18n } = useTranslation();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 100,
      }}
    >
      <Stack direction="row" spacing={1}>
        <Button
          onClick={() => i18n.changeLanguage('pt-BR')}
          variant={i18n.language === 'pt-BR' ? 'contained' : 'outlined'}
          size="small"
          color="info"
        >
          <FlagIcon langCode="pt-BR" />
        </Button>
        <Button
          onClick={() => i18n.changeLanguage('en')}
          variant={i18n.language === 'en' ? 'contained' : 'outlined'}
          size="small"
          color="info"
        >
          <FlagIcon langCode="en" />
        </Button>
        <Button
          onClick={() => i18n.changeLanguage('es')}
          variant={i18n.language === 'es' ? 'contained' : 'outlined'}
          size="small"
          color="info"
        >
          <FlagIcon langCode="es" />
        </Button>
      </Stack>
    </Box>
  );
};

export default LanguageActionButtons;