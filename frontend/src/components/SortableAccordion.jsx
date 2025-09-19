import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { IconButton, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, DragIndicator as DragIndicatorIcon, Close as CloseIcon } from '@mui/icons-material';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from 'react-i18next';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const baseLanguages = [
  'pt-BR', 'en-US', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN',
];

const languageNames = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'it-IT': 'Italiano',
  'ja-JP': '日本語 (Japonês)',
  'ko-KR': '한국어 (Coreano)',
  'zh-CN': '中文 (Chinês)',
};

const SortableAccordion = ({ question, index, expanded, onAccordionChange, handleQuestionChange, handleTranslationChange, addTranslation, removeTranslation, removeQuestion, formData }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '16px',
  };

  const getQuestionLabel = () => {
    const label = question.label;
    if (label && label.length > 30) {
      return `${label.substring(0, 30)}...`;
    }
    return label || `${t("menu_form_question")} ${index + 1}`;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Accordion expanded={expanded} onChange={onAccordionChange}>
        <AccordionSummary 
          aria-controls={`panel${index}d-content`} 
          id={`panel${index}d-header`}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton {...listeners} {...attributes} aria-label="reorder" sx={{ cursor: 'grab' }}>
              <DragIndicatorIcon />
            </IconButton>
            <Typography sx={{ flexGrow: 1 }}>
              {getQuestionLabel()}
            </Typography>
            <IconButton
              onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
              color="error"
              aria-label="remove question"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label={t("menu_form_question_title")}
                name="label"
                value={question.label}
                onChange={(e) => handleQuestionChange(index, e)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id={`type-label-${index}`}>{t("menu_form_question_type")}</InputLabel>
                <Select
                  labelId={`type-label-${index}`}
                  name="type"
                  value={question.type}
                  label={t("menu_form_question_type")}
                  onChange={(e) => handleQuestionChange(index, e)}
                >
                  <MenuItem value="TEXT">{t("menu_form_question_option_text")}</MenuItem>
                  <MenuItem value="CHOICE">{t("menu_form_question_option_multiple_choice")}</MenuItem>
                  <MenuItem value="YES_NO">{t("menu_form_question_option_single_choice")}</MenuItem>
                  <MenuItem value="SCALE">{t("menu_form_question_option_scale")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(question.type === "CHOICE" || question.type === "SCALE") && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("menu_form_question_option_scale_1_to_5")}
                  name="options"
                  value={question.options}
                  onChange={(e) => handleQuestionChange(index, e)}
                  disabled={question.type === "SCALE"}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!question.mandatory}
                      onChange={(e) => handleQuestionChange(index, e)}
                      name="mandatory"
                    />
                  }
                  label={t("menu_form_question_required")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!question.deniable}
                      onChange={(e) => handleQuestionChange(index, e)}
                      name="deniable"
                    />
                  }
                  label={t("menu_form_question_deniable")}
                />
              </FormGroup>
            </Grid>
          </Grid>
          <Box
            mt={3}
            p={2}
            sx={{
              border: "1px dashed #bdbdbd",
              borderRadius: "4px",
              backgroundColor: "grey.50",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {t("menu_form_question_translation_title")}
              </Typography>
              <Button
                onClick={() => addTranslation(index)}
                startIcon={<AddIcon />}
                size="small"
              >
                {t("menu_form_add")}
              </Button>
            </Box>
            {question.translations.map((translation, tIndex) => (
              <Grid container spacing={2} key={tIndex} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>{t("menu_form_questions_translation_language")}</InputLabel>
                    <Select
                      name="language"
                      value={translation.language}
                      onChange={(e) => handleTranslationChange(index, tIndex, e)}
                      label={t("menu_form_questions_translation_language")}
                    >
                      {baseLanguages.map((langCode) => (
                        <MenuItem key={langCode} value={langCode}>
                          {languageNames[langCode]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t("translatedTitle")}
                    name="label"
                    value={translation.label}
                    onChange={(e) =>
                      handleTranslationChange(index, tIndex, e)
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={1}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <IconButton
                    onClick={() => removeTranslation(index, tIndex)}
                    color="error"
                    aria-label="remove translation"
                  >
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default SortableAccordion;