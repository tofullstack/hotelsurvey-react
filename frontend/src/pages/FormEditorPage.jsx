import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormService from "../services/form.service";

import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CompanyService from "../services/company.service";

// NOVO: Lista de idiomas para o menu select
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

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    companyId: "",
    serieEmpresa: "",
    conditional: false,
    denyUse: false,
    active: true,
    questions: [
      {
        id: "temp-1",
        label: "",
        type: "TEXT",
        mandatory: false,
        deniable: false,
        options: "",
        translations: [{ language: "", label: "" }],
      },
    ],
    triggers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewForm, setIsNewForm] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [conditionalForms, setConditionalForms] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await CompanyService.getAllCompanies();
        setCompanies(response?.content || []);
      } catch (err) {
        console.error("Erro ao carregar empresas", err);
      }
    };
    fetchCompanies();

    if (formId) {
      setIsNewForm(false);
      const fetchForm = async () => {
        try {
          const data = await FormService.getFormById(formId);
          const formattedQuestions = data.questions.map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options.join(", ") : "",
            translations:
              Array.isArray(q.translations) && q.translations.length > 0
                ? q.translations
                : [{ language: "", label: "" }],
          }));
          setFormData({
            ...data,
            questions: formattedQuestions,
            triggers: data.triggers || [],
          });
          setLoading(false);
        } catch (err) {
          setError(
            err.response?.data?.message ||
              "Falha ao carregar formulário para edição"
          );
          setLoading(false);
        }
      };
      fetchForm();
    } else {
      setLoading(false);
      setIsNewForm(true);
    }
  }, [formId]);

  useEffect(() => {
    const fetchConditionalForms = async () => {
      if (formData.companyId) {
        try {
          const response = await FormService.getConditionalFormsForCompany(
            formData.companyId
          );
          setConditionalForms(response);
        } catch (err) {
          console.error("Erro ao carregar formulários condicionais", err);
        }
      }
    };
    fetchConditionalForms();
  }, [formData.companyId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "companyId") {
      const selectedCompany = companies.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        companyId: value,
        serieEmpresa: selectedCompany ? selectedCompany.serieEmpresa : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleQuestionChange = (questionIndex, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...formData.questions];
    
    // ATUALIZAÇÃO: Lógica para preencher o campo 'options' automaticamente para o tipo 'SCALE'
    if (name === "type" && value === "SCALE") {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        type: value,
        options: "1, 2, 3, 4, 5",
      };
    } else {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [name]: type === "checkbox" ? checked : value,
      };
    }
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };
  
  const handleTranslationChange = (questionIndex, translationIndex, e) => {
    const { name, value } = e.target;
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].translations[translationIndex] = {
      ...newQuestions[questionIndex].translations[translationIndex],
      [name]: value,
    };
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleTriggerChange = (triggerIndex, e) => {
    const { name, value } = e.target;
    const newTriggers = [...formData.triggers];
    newTriggers[triggerIndex] = {
      ...newTriggers[triggerIndex],
      [name]: value,
    };
    setFormData((prev) => ({ ...prev, triggers: newTriggers }));
  };

  const addTrigger = () => {
    setFormData((prev) => ({
      ...prev,
      triggers: [
        ...prev.triggers,
        {
          questionId: "",
          targetSectionId: "",
          triggerValue: "",
        },
      ],
    }));
  };

  const removeTrigger = (index) => {
    const newTriggers = formData.triggers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, triggers: newTriggers }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `temp-${Date.now()}`,
          label: "",
          type: "TEXT",
          mandatory: false,
          deniable: false,
          options: "",
          translations: [{ language: "", label: "" }],
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    const questionToRemoveId = formData.questions[index].id;
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    const newTriggers = formData.triggers.filter(
      (t) => t.questionId !== questionToRemoveId
    );
    setFormData((prev) => ({
      ...prev,
      questions: newQuestions,
      triggers: newTriggers,
    }));
  };

  const addTranslation = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].translations.push({ language: "", label: "" });
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const removeTranslation = (questionIndex, translationIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].translations = newQuestions[
      questionIndex
    ].translations.filter((_, i) => i !== translationIndex);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const tempIdMap = {};
      formData.questions.forEach((q, index) => {
        if (q.id.toString().startsWith("temp-")) {
          tempIdMap[q.id] = index;
        }
      });

      const cleanedQuestions = formData.questions.map((q) => {
        let formattedOptions = [];
        if (q.type === "CHOICE" || q.type === "SCALE") {
          formattedOptions = q.options
            .split(",")
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0);
        } else {
          formattedOptions = [];
        }

        const questionLabel = q.label || "";
        let filteredTranslations = q.translations.filter(
          (t) => t.language && t.label
        );

        const defaultLanguageTranslationExists = filteredTranslations.some(
          (t) => t.language === formData.language
        );

        if (
          formData.language &&
          questionLabel &&
          !defaultLanguageTranslationExists
        ) {
          filteredTranslations.push({
            language: formData.language,
            label: questionLabel,
          });
        }

        if (
          filteredTranslations.length === 0 &&
          questionLabel &&
          formData.language
        ) {
          filteredTranslations.push({
            language: formData.language,
            label: questionLabel,
          });
        }

        return {
          id: q.id.toString().startsWith("temp-") ? null : q.id,
          label: questionLabel,
          type: q.type,
          mandatory: q.mandatory ?? false,
          deniable: q.deniable ?? false,
          options: formattedOptions,
          translations: filteredTranslations,
        };
      });

      const payload = {
        ...formData,
        questions: cleanedQuestions,
        denyUse: formData.denyUse ?? false,
        active: formData.active ?? false,
        conditional: formData.conditional ?? false,
        triggers: formData.triggers.map((t) => ({
          ...t,
          questionId: t.questionId.toString().startsWith("temp-")
            ? tempIdMap[t.questionId]
            : t.questionId,
        })),
      };

      if (isNewForm) {
        await FormService.createForm(payload);
      } else {
        await FormService.updateForm(formId, payload);
      }
      navigate("/admin/forms");
    } catch (err) {
      setError(err.response?.data?.message || "Falha ao salvar formulário.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        mb={4}
        fontWeight="bold"
      >
        {isNewForm ? "Novo Formulário" : `Editar Formulário: ${formData.name}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component={Paper} elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" component="h2" mb={3} fontWeight="bold">
            Informações Gerais
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Formulário"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            {/* NOVO: Substituindo o TextField por um Select para o idioma */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="language-label">Idioma Padrão</InputLabel>
                <Select
                  labelId="language-label"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  label="Idioma Padrão"
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
              <FormControl fullWidth required>
                <InputLabel id="company-label">Empresa</InputLabel>
                <Select
                  labelId="company-label"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  label="Empresa"
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Série da Empresa"
                name="serieEmpresa"
                value={formData.serieEmpresa}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup row sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.conditional}
                      onChange={handleInputChange}
                      name="conditional"
                    />
                  }
                  label="Formulário Condicional"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.denyUse}
                      onChange={handleInputChange}
                      name="denyUse"
                    />
                  }
                  label='Permitir opção "Não utilizei este serviço"'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.active}
                      onChange={handleInputChange}
                      name="active"
                    />
                  }
                  label="Ativo"
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h3" mb={3} fontWeight="bold">
            Perguntas
          </Typography>

          {formData.questions.map((q, index) => (
            <Card
              key={q.id}
              sx={{
                mb: 3,
                boxShadow: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <Typography variant="h6">Pergunta {index + 1}</Typography>
                  <IconButton
                    onClick={() => removeQuestion(index)}
                    color="error"
                    aria-label="remove question"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Título da Pergunta"
                      name="label"
                      value={q.label}
                      onChange={(e) => handleQuestionChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id={`type-label-${index}`}>Tipo</InputLabel>
                      <Select
                        labelId={`type-label-${index}`}
                        name="type"
                        value={q.type}
                        label="Type"
                        onChange={(e) => handleQuestionChange(index, e)}
                      >
                        <MenuItem value="TEXT">Texto</MenuItem>
                        <MenuItem value="CHOICE">Múltipla Escolha</MenuItem>
                        <MenuItem value="YES_NO">Sim/Não</MenuItem>
                        <MenuItem value="SCALE">Escala</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {(q.type === "CHOICE" || q.type === "SCALE") && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Opções (separadas por vírgula)"
                        name="options"
                        value={q.options}
                        onChange={(e) => handleQuestionChange(index, e)}
                        // NOVO: Desabilita o campo se o tipo for 'SCALE'
                        disabled={q.type === "SCALE"}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!q.mandatory}
                            onChange={(e) => handleQuestionChange(index, e)}
                            name="mandatory"
                          />
                        }
                        label="Obrigatória"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!q.deniable}
                            onChange={(e) => handleQuestionChange(index, e)}
                            name="deniable"
                          />
                        }
                        label="Opção 'Não Utilizei'"
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
                      Traduções da Pergunta
                    </Typography>
                    <Button
                      onClick={() => addTranslation(index)}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Adicionar
                    </Button>
                  </Box>
                  {q.translations.map((t, tIndex) => (
                    <Grid container spacing={2} key={tIndex} sx={{ mb: 2 }}>
                      {/* NOVO: Adiciona o Select para o idioma da tradução */}
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth>
                          <InputLabel>Idioma</InputLabel>
                          <Select
                            name="language"
                            value={t.language}
                            onChange={(e) => handleTranslationChange(index, tIndex, e)}
                            label="Idioma"
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
                          label="Título Traduzido"
                          name="label"
                          value={t.label}
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
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ mb: 3 }}
          >
            Adicionar Pergunta
          </Button>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h3" mb={3} fontWeight="bold">
            Gatilhos Condicionais
          </Typography>
          <Box
            p={2}
            sx={{
              border: "1px dashed #bdbdbd",
              borderRadius: "4px",
              backgroundColor: "grey.50",
            }}
          >
            <Button
              onClick={addTrigger}
              startIcon={<AddIcon />}
              size="small"
              disabled={
                !formData.companyId ||
                conditionalForms.length === 0 ||
                formData.questions.filter((q) => q.type !== "TEXT").length === 0
              }
            >
              Adicionar Gatilho
            </Button>
            {formData.triggers.map((t, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2, mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Pergunta Gatilho</InputLabel>
                    <Select
                      name="questionId"
                      value={t.questionId}
                      onChange={(e) => handleTriggerChange(index, e)}
                      label="Pergunta Gatilho"
                    >
                      {formData.questions
                        .filter((q) => q.type !== "TEXT")
                        .map((q) => (
                          <MenuItem key={q.id} value={q.id}>
                            {q.label ||
                              `Pergunta ${
                                formData.questions.findIndex(
                                  (item) => item.id === q.id
                                ) + 1
                              }`}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Valor da Resposta"
                    name="triggerValue"
                    value={t.triggerValue}
                    onChange={(e) => handleTriggerChange(index, e)}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>Seção de Destino</InputLabel>
                    <Select
                      name="targetSectionId"
                      value={t.targetSectionId}
                      onChange={(e) => handleTriggerChange(index, e)}
                      label="Seção de Destino"
                    >
                      {conditionalForms
                        .filter((form) =>
                          isNewForm ? true : form.id !== formId
                        )
                        .map((form) => (
                          <MenuItem key={form.id} value={form.id}>
                            {form.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    onClick={() => removeTrigger(index)}
                    color="error"
                    aria-label="remove trigger"
                  >
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            {!formData.companyId && (
              <Typography variant="caption" color="text.secondary">
                Selecione uma empresa para carregar os formulários
                condicionais.
              </Typography>
            )}
            {formData.companyId &&
              conditionalForms.length === 0 &&
              formData.questions.filter((q) => q.type !== "TEXT").length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Nenhum formulário condicional encontrado para esta empresa.
                </Typography>
              )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={isNewForm ? <AddIcon /> : <SaveIcon />}
            sx={{ mt: 3, py: 1.5 }}
          >
            {isNewForm ? "Criar Formulário" : "Salvar Mudanças"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormEditorPage;