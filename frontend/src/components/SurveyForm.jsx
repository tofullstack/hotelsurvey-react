import React, { useState, useEffect } from "react";
import QuestionComponent from "./QuestionComponent";
import PublicSurveyService from "../services/public.survey.service";
import ConditionalTriggerService from '../services/conditional.trigger.service';
import { useTranslation } from 'react-i18next';


import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Modal,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const SurveyForm = ({ formId, language }) => {

  const { t } = useTranslation();

  const [surveyStructure, setSurveyStructure] = useState(null);
  const [allAnswers, setAllAnswers] = useState({});
  const [guestUH, setGuestUH] = useState(""); 
  const [guestLastName, setGuestLastName] = useState(""); 
  const [freeTextFeedback, setFreeTextFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formPhase, setFormPhase] = useState('identification'); 

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionalForm, setConditionalForm] = useState(null);
  const [conditionalAnswers, setConditionalAnswers] = useState({});

  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  const baseLanguages = [
    'pt-BR', 'en-US', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN',
  ];
  const [availableLanguages, setAvailableLanguages] = useState(baseLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languageNames = {
    'pt-BR': t('ptLanguageName'),
    'en-US': t('enLanguageName'),
    'de-DE': t('deLanguageName'),
    'es-ES': t('esLanguageName'),
    'fr-FR': t('frLanguageName'),
    'it-IT': t('itLanguageName'),
    'ja-JP': t('jaLanguageName'),
    'ko-KR': t('koLanguageName'),
    'zh-CN': t('zhLanguageName'),
  };

  const showAlert = (message, severity) => {
    setAlertInfo({ open: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ ...alertInfo, open: false });
    }, 3000); 
  };


  useEffect(() => {
    if (!formId || !selectedLanguage) {
      setError(t("invalidFormUrl"));
      setLoading(false);
      return;
    }

    const fetchSurvey = async () => {
      try {
        const data = await PublicSurveyService.getSurveyQuestions(formId, selectedLanguage);
        setSurveyStructure(data);

        if (data && data.questions) {
          const dynamicLanguages = new Set();
          data.questions.forEach(q => {
            if (q.translations && Array.isArray(q.translations)) {
              q.translations.forEach(t => {
                if (t.language) {
                  dynamicLanguages.add(t.language);
                }
              });
            }
          });
          const mergedLanguages = Array.from(new Set([...baseLanguages, ...Array.from(dynamicLanguages)]));
          mergedLanguages.sort((a, b) => {
            const nameA = languageNames[a] || a;
            const nameB = languageNames[b] || b;
            return nameA.localeCompare(nameB);
          });
          setAvailableLanguages(mergedLanguages);

          const initialAnswers = {};
          data.questions.forEach((question) => {
            initialAnswers[question.id] = {
              value: "",
              surveySectionId: question.surveySectionId 
            };
          });
          setAllAnswers(initialAnswers);
        }
        setLoading(false);
      } catch (err) {
        setError(t("failToLoadSurvey"));
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [formId, selectedLanguage, t]);

const handleAnswerChange = async (questionId, value) => {
  const currentQuestion = surveyStructure.questions.find(q => q.id === questionId);
  if (!currentQuestion) return;

  setAllAnswers(prev => ({
      ...prev,
      [questionId]: {
          value: value,
          surveySectionId: currentQuestion.surveySectionId
      }
  }));

  try {
      const conditionalForms = await ConditionalTriggerService.getConditionalForms( 
          questionId,
          value,
          selectedLanguage
      );

      if (conditionalForms && conditionalForms.length > 0) {
          setIsModalOpen(true);
          setConditionalForm(conditionalForms[0]);

          const initialConditionalAnswers = {};
          conditionalForms[0].questions.forEach(q => initialConditionalAnswers[q.id] = "");
          setConditionalAnswers(initialConditionalAnswers);
      } else {

          setTimeout(() => {
              if (currentQuestionIndex < (surveyStructure?.questions?.length || 0) - 1) {
                  setCurrentQuestionIndex(prevIndex => prevIndex + 1);
              } else {
                  setFormPhase('final_feedback'); 
              }
          }, 500);
      }
  } catch (err) {
      console.error('Error fetching conditional form:', err);
      setTimeout(() => {
          if (currentQuestionIndex < (surveyStructure?.questions?.length || 0) - 1) {
              setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          } else {
              setFormPhase('final_feedback'); 
          }
      }, 500);
  }
};

  const handleConditionalAnswerChange = (questionId, value) => {
    setConditionalAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleConditionalSubmit = async (e) => {
    e.preventDefault();
  
    const areAllAnswered = conditionalForm.questions.every(q => {
      return !!conditionalAnswers[q.id];
    });
  
    if (!areAllAnswered) {
      showAlert(t('messageConditionalForm'), 'error');
      return; 
    }
  
    setAllAnswers(prev => {
      const newAnswers = { ...prev };
      conditionalForm.questions.forEach(q => {
        newAnswers[q.id] = {
          value: conditionalAnswers[q.id],
          surveySectionId: conditionalForm.id 
        };
      });
      return newAnswers;
    });
  
    setConditionalForm(null);
    setConditionalAnswers({});
    setIsModalOpen(false);
  
    setTimeout(() => {
      if (currentQuestionIndex < (surveyStructure?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        setFormPhase('final_feedback');
      }
    }, 500);
  };

  const handleIdentificationSubmit = (e) => {
    e.preventDefault();

    // ATUALIZAÇÃO: Verifica guestUH (antigo guestIdentifier)
    if (!guestUH.trim()) {
        showAlert(t('guestUhRequired'), 'warning');
        return;
    }
    // guestLastName é opcional e não precisa de validação obrigatória

    setFormPhase('questions');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormPhase('submitting');
    setError(null);

    const submittedAnswers = Object.keys(allAnswers).map(questionId => {
      const answerData = allAnswers[questionId];

      return {
        questionId: parseInt(questionId),
        surveySectionId: answerData.surveySectionId || surveyStructure.id,
        answerValue: answerData.value || "",
        didNotUseService: false,
      };
    });

    const surveyData = {
      companyId: surveyStructure.companyId,
      formId: formId,
      // ATUALIZAÇÃO: Mapeamento para guestUH e guestLastName
      guestUH: guestUH,
      guestLastName: guestLastName,
      // Fim das ATUALIZAÇÕES
      freeTextFeedback: freeTextFeedback,
      language: selectedLanguage,
      answers: submittedAnswers,
      serieEmpresa: surveyStructure.serieEmpresa,
    };

    try {
      await PublicSurveyService.submitSurveyResponse(surveyData);
      setFormPhase("success");
      setTimeout(() => window.location.reload(), 5000);
    } catch (err) {
      setFormPhase("error");
      setError(t("failToSubmitSurvey"));
    }
  };

  const renderConditionalForm = () => {
    if (!conditionalForm) {
      return <CircularProgress />;
    }
    return (
      <Box component="form" onSubmit={handleConditionalSubmit} sx={{ textAlign: 'center' }}>
        {conditionalForm.questions.map(q => (
          <QuestionComponent
            key={q.id}
            question={q}
            value={conditionalAnswers[q.id]}
            onChange={(val) => handleConditionalAnswerChange(q.id, val)}
            language={selectedLanguage}
          />
        ))}
        {alertInfo.open && alertInfo.severity === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
                {alertInfo.message}
            </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          {t("sendAndContinue")}
        </Button>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /><Typography variant="body1" sx={{ ml: 2 }}>{t("loadingSurvey")}</Typography></Box>;
    }
    if (error && formPhase !== "success") {
      return <Alert severity="error">{t("error")}: {error}</Alert>;
    }
    if (formPhase === "success") {
      return (<Box sx={{ textAlign: "center", mt: 5, py: 10 }}><Typography variant="h3" gutterBottom sx={{ color: 'success.main' }}>{t("thanks")}</Typography>
      <Typography variant="h5">{t("thanksMessage")}</Typography></Box>);
    }

    if (formPhase === 'identification') {
      return (
        <Card sx={{ mb: 4, boxShadow: 1 }}>
          <CardHeader title={t("initialIdentification")} sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }} />
          <CardContent>
            <Box component="form" onSubmit={handleIdentificationSubmit}>
              <Typography variant="h6" sx={{ mb: 2 }}>{t("identifyYourselfToStart")}</Typography>
              <TextField 
                required
                fullWidth 
                margin="normal" 
                label={t("guestUhIndicator")} 
                value={guestUH} 
                onChange={(e) => setGuestUH(e.target.value)} 
                InputProps={{ startAdornment: (<PersonIcon sx={{ mr: 1, color: "action.active" }} />) }} 
                helperText={t('guestUhRequiredHelp')}
              />
              <TextField 
                fullWidth 
                margin="normal" 
                label={t("guestLastName")} 
                value={guestLastName} 
                onChange={(e) => setGuestLastName(e.target.value)} 
                InputProps={{ startAdornment: (<PersonIcon sx={{ mr: 1, color: "action.active" }} />) }} 
                helperText={t('guestLastNameOptionalHelp')}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large" 
                fullWidth 
                sx={{ mt: 3 }}
                endIcon={<SendIcon />}
              >
                {t("startSurvey")}
              </Button>
              {alertInfo.open && alertInfo.severity === 'warning' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    {alertInfo.message}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (formPhase === 'questions') {
      const currentQuestion = surveyStructure?.questions?.[currentQuestionIndex];
      if (currentQuestion) {
        return (
          <Card key={surveyStructure.id} sx={{ mb: 4, boxShadow: 1 }}>
            <CardHeader
              title={`${currentQuestionIndex + 1} / ${surveyStructure.questions.length}`}
              sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
            />
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <QuestionComponent
                  question={currentQuestion}
                  value={allAnswers[currentQuestion.id]?.value}
                  onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                  isSectionDenied={false}
                  language={selectedLanguage}
                />
              </Box>
            </CardContent>
          </Card>
        );
      }
    }

    if (formPhase === 'final_feedback') {
      return (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" sx={{ mb: 2 }}>{t("additionalDetails")}</Typography>
          <TextField fullWidth multiline rows={4} margin="normal" label={t("additionalDetails")} inputProps={{ maxLength: 500 }} value={freeTextFeedback} onChange={(e) => setFreeTextFeedback(e.target.value)} placeholder={t("additionalDetailsPlaceholder")} InputProps={{ startAdornment: (<ChatIcon sx={{ mr: 1, color: "action.active" }} />) }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", textAlign: "right" }}>{freeTextFeedback.length}/500 {t("characters")}</Typography>
          
          {formPhase === 'submitting' ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /><Typography variant="body1" sx={{ ml: 2 }}>{t("submitting")}</Typography></Box>
          ) : (
              <Button type="submit" variant="contained" color="success" size="large" fullWidth sx={{ mt: 3 }} startIcon={<SendIcon />}>{t("submit")}</Button>
          )}

        </Box>
      );
    }
    
    if (formPhase === 'submitting') {
        return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /><Typography variant="body1" sx={{ ml: 2 }}>{t("submitting")}</Typography></Box>;
    }
    if (formPhase === 'error') {
        return <Alert severity="error">{t("error")}: {error}</Alert>;
    }

    return null;
  };

  return (
    <Container maxWidth="md" sx={{ my: 5 }}>
      <Grid container justifyContent="flex-end" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">{t("language")}</InputLabel>
            <Select
              labelId="language-select-label"
              value={selectedLanguage}
              label={t("language")}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {availableLanguages.map((langCode) => (
                <MenuItem key={langCode} value={langCode}>
                  {languageNames[langCode] || langCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {renderContent()}

      <Modal
        open={isModalOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableEscapeKeyDown={true}
      >
        <Box sx={style}>
          {renderConditionalForm()}
        </Box>
      </Modal>
    </Container>
  );
};

export default SurveyForm;