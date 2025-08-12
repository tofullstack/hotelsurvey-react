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

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    companyId: "",
    denyUse: false,
    active: true,
    questions: [
      {
        label: "",
        type: "TEXT",
        mandatory: false,
        deniable: false,
        options: "",
        translations: [{ language: "", label: "" }],
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewForm, setIsNewForm] = useState(true);
  const [companies, setCompanies] = useState([]);

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
          setFormData({ ...data, questions: formattedQuestions });
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || "Falha ao carregar formulário para edição");
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
      <Typography variant="h4" component="h1" align="center" mb={4} fontWeight="bold">
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Idioma Padrão (e.g., pt-BR, en-US)"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              />
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
              <FormGroup row sx={{ mt: 1 }}>
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
            <Card key={index} sx={{ mb: 3, boxShadow: 1, border: "1px solid #e0e0e0" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid #f0f0f0"
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
                  sx={{ border: "1px dashed #bdbdbd", borderRadius: "4px", backgroundColor: "grey.50" }}
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
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Código do Idioma (e.g., pt-BR)"
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