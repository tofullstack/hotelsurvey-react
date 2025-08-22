import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormService from "../services/form.service";
import { useTranslation, Trans } from "react-i18next";

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
  const { t } = useTranslation();


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
            t("failToLoadForms")
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
          console.error(t("failToLoadConditionalForms"), err);
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
        {isNewForm ? t("newForm") : t("editForm", { formName: formData.name })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component={Paper} elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" component="h2" mb={3} fontWeight="bold">
            {t("geralInformation")}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("menu_form_name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="language-label">{t("menu_form_language")}</InputLabel>
                <Select
                  labelId="language-label"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  label={t("menu_form_language")}
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
                <InputLabel id="company-label">{t("menu_form_company")}</InputLabel>
                <Select
                  labelId="company-label"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  label={t("menu_form_company")}
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
                label={t("menu_form_company_serie")}
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
                  label={t("menu_form_conditional_form")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.denyUse}
                      onChange={handleInputChange}
                      name="denyUse"
                    />
                  }
                  label={t("menu_form_denyUse")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.active}
                      onChange={handleInputChange}
                      name="active"
                    />
                  }
                  label={t("menu_form_active")}
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h3" mb={3} fontWeight="bold">
            {t("menu_form_questions")}
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
                  <Typography variant="h6">{t("menu_form_question")} {index + 1}</Typography>
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
                      label={t("menu_form_question_title")}
                      name="label"
                      value={q.label}
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
                        value={q.type}
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
                  {(q.type === "CHOICE" || q.type === "SCALE") && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t("menu_form_question_option_scale_1_to_5")}
                        name="options"
                        value={q.options}
                        onChange={(e) => handleQuestionChange(index, e)}
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
                        label={t("menu_form_question_required")}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!q.deniable}
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
                  {q.translations.map((translation, tIndex) => (
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
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ mb: 3 }}
          >
            {t("addQuestion")}
          </Button>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h3" mb={3} fontWeight="bold">
            {t("conditionalTriggers")}
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
              {t("addTrigger")}
            </Button>

            {formData.triggers.map((trigger, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2, mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t("triggerQuestion")}</InputLabel>
                    <Select
                      name="questionId"
                      value={trigger.questionId}
                      onChange={(e) => handleTriggerChange(index, e)}
                      label={t("triggerQuestion")}
                    >
                      {formData.questions
                        .filter((q) => q.type !== "TEXT")
                        .map((q) => (
                          <MenuItem key={q.id} value={q.id}>
                            {q.label ||
                              `${t("question")} ${formData.questions.findIndex(
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
                    label={t("triggerValue")}
                    name="triggerValue"
                    value={trigger.triggerValue}
                    onChange={(e) => handleTriggerChange(index, e)}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>{t("targetSection")}</InputLabel>
                    <Select
                      name="targetSectionId"
                      value={trigger.targetSectionId}
                      onChange={(e) => handleTriggerChange(index, e)}
                      label={t("targetSection")}
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
                {t("selectCompanyForConditionals")}
              </Typography>
            )}
            {formData.companyId &&
              conditionalForms.length === 0 &&
              formData.questions.filter((q) => q.type !== "TEXT").length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {t("noConditionalFormsFound")}
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
            {isNewForm ? t("createForm") : t("saveChanges")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormEditorPage;