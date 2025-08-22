import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import FormService from '../services/form.service';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const PreviewModal = ({ open, handleClose, formId }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && formId) {
      const fetchPreviewData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await FormService.previewForm(formId);
          setFormData(data);
        } catch (err) {
          setError(t('failToLoadPreview'));
          console.error('Error fetching preview data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPreviewData();
    }
  }, [open, formId, t]); // Add 't' to the dependency array

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="preview-modal-title"
    >
      <Box sx={style}>
        <Typography id="preview-modal-title" variant="h5" component="h2" mb={2}>
          {t('formPreviewTitle')}
        </Typography>
        
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        
        {formData && (
          <>
            <Typography variant="h6">{formData.name}</Typography>
            {/* <Typography variant="body2" color="text.secondary">
              {t('company')}: {formData.companyName}
            </Typography> */}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6">
              {t('questions')}:
            </Typography>
            <List>
              {formData.questions.map((question, index) => (
                <Box key={question.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${index + 1}. ${question.label}`}
                      secondary={`${t('type')}: ${t(question.type)} | ${t('required')}: ${question.mandatory ? t('yes') : t('no')}`}
                    />
                    <Box sx={{ ml: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {question.options && question.options.map((option, optIndex) => (
                        <Chip key={optIndex} label={option} size="small" />
                      ))}
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </List>
          </>
        )}
        
        <Button onClick={handleClose} sx={{ mt: 3 }} variant="outlined" color="error">
          {t('close')}
        </Button>
      </Box>
    </Modal>
  );
};

export default PreviewModal;