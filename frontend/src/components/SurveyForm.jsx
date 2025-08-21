import React, { useState, useEffect } from "react";
import QuestionComponent from "./QuestionComponent";
import PublicSurveyService from "../services/public.survey.service";
import ConditionalTriggerService from '../services/conditional.trigger.service'; // novo import
//import { useParams } from "react-router-dom";
import Rating from '@mui/material/Rating';


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
  FormControlLabel,
  Checkbox,
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

  const [surveyStructure, setSurveyStructure] = useState(null);
  const [allAnswers, setAllAnswers] = useState({}); // estado unificado para todas as respostas
  const [guestIdentifier, setGuestIdentifier] = useState("");
  const [freeTextFeedback, setFreeTextFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formPhase, setFormPhase] = useState('questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionalForm, setConditionalForm] = useState(null);
  const [conditionalAnswers, setConditionalAnswers] = useState({});

  const baseLanguages = [
    'pt-BR', 'en-US', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN',
  ];
  const [availableLanguages, setAvailableLanguages] = useState(baseLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

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

  useEffect(() => {
    if (!formId || !selectedLanguage) {
      setError("URL do formulário inválida. Faltando id do formulário ou idioma.");
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
        setError("Falha ao carregar a pesquisa. Por favor, tente novamente mais tarde.");
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [formId, selectedLanguage]);

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

    if (currentQuestion && currentQuestion.type === 'SCALE' && value <= 3) {
      try {
        const conditionalForms = await ConditionalTriggerService.getConditionalForms(
          questionId,
          value.toString(), 
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
              setFormPhase('details');
            }
          }, 500);
        }
      } catch (err) {
        console.error('error fetching conditional form:', err);
        setTimeout(() => {
          if (currentQuestionIndex < (surveyStructure?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          } else {
            setFormPhase('details');
          }
        }, 500);
      }
    } else {
      setTimeout(() => {
        if (currentQuestionIndex < (surveyStructure?.questions?.length || 0) - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
          setFormPhase('details');
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
        setFormPhase('details');
      }
    }, 500);
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
    guestIdentifier: guestIdentifier,
    freeTextFeedback: freeTextFeedback,
    answers: submittedAnswers,
    serieEmpresa: surveyStructure.serieEmpresa,
  };

  try {
    await PublicSurveyService.submitSurveyResponse(surveyData);
    setFormPhase("success");
    setTimeout(() => window.location.reload(), 5000);
  } catch (err) {
    setFormPhase("error");
    setError("Falha ao enviar a pesquisa.");
  }
};


  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
  };

  const renderConditionalForm = () => {
    if (!conditionalForm) {
      return <CircularProgress />;
    }
    return (
      <Box component="form" onSubmit={handleConditionalSubmit} sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{conditionalForm.name}</Typography>
        {conditionalForm.questions.map(q => (
          <QuestionComponent
            key={q.id}
            question={q}
            value={conditionalAnswers[q.id]}
            onChange={(val) => handleConditionalAnswerChange(q.id, val)}
            language={selectedLanguage}
          />
        ))}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Enviar e Continuar
        </Button>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /><Typography variant="body1" sx={{ ml: 2 }}>carregando pesquisa...</Typography></Box>;
    }
    if (error && formPhase !== "success") {
      return <Alert severity="error">erro: {error}</Alert>;
    }
    if (formPhase === "success") {
      return (<Box sx={{ textAlign: "center", mt: 5, py: 10 }}><Typography variant="h3" gutterBottom sx={{ color: 'success.main' }}>🎉 Obrigado!</Typography><Typography variant="h5">Sua resposta foi enviada com sucesso.</Typography></Box>);
    }

    if (formPhase === 'questions') {
      const currentQuestion = surveyStructure?.questions?.[currentQuestionIndex];
      if (currentQuestion) {
        return (
          <Card key={surveyStructure.id} sx={{ mb: 4, boxShadow: 1 }}>
            <CardHeader
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

    if (formPhase === 'details') {
      return (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" sx={{ mb: 2 }}>Detalhes adicionais</Typography>
          <TextField fullWidth margin="normal" label="seu identificador (opcional):" value={guestIdentifier} onChange={(e) => setGuestIdentifier(e.target.value)} InputProps={{ startAdornment: (<PersonIcon sx={{ mr: 1, color: "action.active" }} />) }} />
          <TextField fullWidth multiline rows={4} margin="normal" label="Feedback Adicional (Opcional):" inputProps={{ maxLength: 500 }} value={freeTextFeedback} onChange={(e) => setFreeTextFeedback(e.target.value)} placeholder="Compartilhe quaisquer pensamentos ou sugestões aqui..." InputProps={{ startAdornment: (<ChatIcon sx={{ mr: 1, color: "action.active" }} />) }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right" }}>{freeTextFeedback.length}/500 caracteres</Typography>
          <Button type="submit" variant="contained" color="success" size="large" fullWidth sx={{ mt: 3 }} startIcon={<SendIcon />}>Enviar Feedback</Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Container maxWidth="md" sx={{ my: 5 }}>
      <Grid container justifyContent="flex-end" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">Idioma</InputLabel>
            <Select
              labelId="language-select-label"
              value={selectedLanguage}
              label="Idioma"
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
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {renderConditionalForm()}
        </Box>
      </Modal>
    </Container>
  );
};

export default SurveyForm;