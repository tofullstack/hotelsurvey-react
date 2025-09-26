import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormService from "../services/form.service";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableAccordion from "../components/SortableAccordion.jsx";

import {
  Container,
  Box,
  IconButton,
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
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
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
  const [expanded, setExpanded] = useState(false); 
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
            id: q.id || `temp-${Date.now() + Math.random()}`,
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
          if (formattedQuestions.length > 0) {
            setExpanded(formattedQuestions[0].id);
          }
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

  const handleAccordionChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : false);
  };

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

    if (name === "questionId") {
      newTriggers[triggerIndex] = {
        ...newTriggers[triggerIndex],
        [name]: value,
        triggerValue: ""
      };
    } else {
      newTriggers[triggerIndex] = {
        ...newTriggers[triggerIndex],
        [name]: value,
      };
    }
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
    const newQuestionId = `temp-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: newQuestionId,
          label: "",
          type: "TEXT",
          mandatory: false,
          deniable: false,
          options: "",
          translations: [{ language: "", label: "" }],
        },
      ],
    }));
    setExpanded(newQuestionId);
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
    setExpanded(false);
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

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = formData.questions.findIndex((q) => q.id === active.id);
      const newIndex = formData.questions.findIndex((q) => q.id === over.id);

      const newQuestions = [...formData.questions];
      const [reorderedItem] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, reorderedItem);

      setFormData((prev) => ({
        ...prev,
        questions: newQuestions,
      }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/admin/dashboard">{t("breadcrumb_home")}
        </Link>
        <Link underline="hover" color="inherit" href="/admin/forms">
          {t("formsTitle")}
        </Link>
        <Typography color="text.primary">
          {isNewForm ? t("newForm") : t("editForm", { formName: formData.name })}
        </Typography>
      </Breadcrumbs>

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

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={formData.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              {formData.questions.map((q, index) => (
                <SortableAccordion
                  key={q.id}
                  question={q}
                  index={index}
                  expanded={expanded === q.id}
                  onAccordionChange={handleAccordionChange(q.id)}
                  handleQuestionChange={handleQuestionChange}
                  handleTranslationChange={handleTranslationChange}
                  addTranslation={addTranslation}
                  removeTranslation={removeTranslation}
                  removeQuestion={removeQuestion}
                  formData={formData}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>

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

            {formData.triggers.map((trigger, index) => {
              const selectedQuestion = formData.questions.find(q => q.id === trigger.questionId);
              const isChoiceQuestion = selectedQuestion?.type === 'CHOICE';
              const isScaleQuestion = selectedQuestion?.type === 'SCALE';

              return (
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
                          .filter((q) => q.type !== "TEXT" && q.type !== "YES_NO")
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

                  <Grid item xs={12} sm={4}>
                    {isChoiceQuestion || isScaleQuestion ? (
                      <FormControl fullWidth>
                        <InputLabel>{t("triggerValue")}</InputLabel>
                        <Select
                          name="triggerValue"
                          value={trigger.triggerValue || ""}
                          onChange={(e) => handleTriggerChange(index, e)}
                          label={t("triggerValue")}
                          required
                        >
                          {isChoiceQuestion && selectedQuestion.options.split(",").map((opt, i) => (
                            <MenuItem key={i} value={opt.trim()}>{opt.trim()}</MenuItem> 
                          ))}
                          {isScaleQuestion && ["1", "2", "3", "4", "5"].map(val => (
                            <MenuItem key={val} value={val}>{val}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        label={t("triggerValue")}
                        name="triggerValue"
                        value={trigger.triggerValue}
                        onChange={(e) => handleTriggerChange(index, e)}
                        disabled
                        placeholder={t("selectTriggerQuestionFirst")}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={3}>
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
              );
            })}
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button
              type="submit"
              variant="contained"
              color="info"
              size="large"
              startIcon={isNewForm ? <AddIcon /> : <SaveIcon />}
            >
              {isNewForm ? t("createForm") : t("saveChanges")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormEditorPage;