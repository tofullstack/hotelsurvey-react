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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    language: "", // Idioma principal do formulário
    companyId: "",
    denyUse: false,
    active: true,
    questions: [
      {
        label: "", // Este é o campo para a label primária da pergunta
        type: "TEXT",
        mandatory: false,
        deniable: false,
        options: "",
        translations: [{ language: "", label: "" }], // Array para traduções adicionais
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewForm, setIsNewForm] = useState(true);

  useEffect(() => {
    if (formId) {
      setIsNewForm(false);
      const fetchForm = async () => {
        try {
          const data = await FormService.getFormById(formId);
          // Ao carregar para edição, converte o array de opções do backend
          // de volta para uma string para exibir no TextField.
          const formattedQuestions = data.questions.map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options.join(", ") : "",
            // Garante que 'translations' é um array, mesmo que venha nulo ou indefinido
            translations:
              Array.isArray(q.translations) && q.translations.length > 0
                ? q.translations
                : [{ language: "", label: "" }], // Adiciona uma tradução vazia se não houver
          }));
          setFormData({ ...data, questions: formattedQuestions });
          setLoading(false);
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to load form for editing."
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (questionIndex, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [name]: type === "checkbox" ? checked : value,
    };
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

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
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
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
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

        // Garante que a label primária da pergunta seja enviada
        const questionLabel = q.label || "";

        // Filtra traduções vazias
        let filteredTranslations = q.translations.filter(
          (t) => t.language && t.label
        );

        // Garante que a tradução para o idioma principal do formulário esteja presente
        // Se o idioma principal do formulário (formData.language) não tiver uma tradução explícita
        // na lista, adicionamos uma usando a 'label' primária da pergunta.
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

        // Se não houver traduções e houver uma label primária, cria uma tradução padrão
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
          // Garante que a propriedade 'label' da pergunta seja enviada
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
      };

      console.log("Payload a ser enviado:", payload);

      if (isNewForm) {
        await FormService.createForm(payload);
      } else {
        await FormService.updateForm(formId, payload);
      }
      navigate("/admin/forms");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form.");
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
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" align="center" mb={4}>
        {isNewForm ? "Create New Form" : `Edit Form: ${formData.name}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Form Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Default Language (e.g., pt-BR, en-US)"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company ID"
              name="companyId"
              type="number"
              value={formData.companyId}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!formData.denyUse}
                    onChange={handleInputChange}
                    name="denyUse"
                  />
                }
                label='Allow "Did not use service" option'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!formData.active}
                    onChange={handleInputChange}
                    name="active"
                  />
                }
                label="Active (publicly visible)"
              />
            </FormGroup>
          </Grid>
        </Grid>

        <Typography variant="h5" component="h3" mt={4} mb={2}>
          Questions
        </Typography>

        {formData.questions.map((q, index) => (
          <Card key={index} sx={{ mb: 3, boxShadow: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Question {index + 1}</Typography>
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
                    label="Question Label (Primary)"
                    name="label"
                    value={q.label}
                    onChange={(e) => handleQuestionChange(index, e)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id={`type-label-${index}`}>Type</InputLabel>
                    <Select
                      labelId={`type-label-${index}`}
                      name="type"
                      value={q.type}
                      label="Type"
                      onChange={(e) => handleQuestionChange(index, e)}
                    >
                      <MenuItem value="TEXT">Text</MenuItem>
                      <MenuItem value="CHOICE">Choice</MenuItem>
                      <MenuItem value="YES_NO">Yes/No</MenuItem>
                      <MenuItem value="SCALE">Scale</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {(q.type === "CHOICE" || q.type === "SCALE") && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Options (comma-separated)"
                      name="options"
                      value={q.options}
                      onChange={(e) => handleQuestionChange(index, e)}
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
                      label="Mandatory"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!q.deniable}
                          onChange={(e) => handleQuestionChange(index, e)}
                          name="deniable"
                        />
                      }
                      label="Deniable"
                    />
                  </FormGroup>
                </Grid>
              </Grid>

              <Box
                mt={3}
                p={2}
                sx={{ border: "1px dashed grey", borderRadius: "4px" }}
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
                    Translations
                  </Typography>
                  <Button
                    onClick={() => addTranslation(index)}
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Add Translation
                  </Button>
                </Box>
                {q.translations.map((t, tIndex) => (
                  <Grid container spacing={2} key={tIndex} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Language Code (e.g., pt-BR)"
                        name="language"
                        value={t.language}
                        onChange={(e) =>
                          handleTranslationChange(index, tIndex, e)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Translated Label"
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
          Add Question
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={isNewForm ? <AddIcon /> : <SaveIcon />}
        >
          {isNewForm ? "Create Form" : "Save Changes"}
        </Button>
      </Box>
    </Container>
  );
};

export default FormEditorPage;
