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
    language: "", // principal do formulário
    companyId: "",
    denyUse: false,
    active: true,
    questions: [
      {
        label: "", //campo para a label primária da pergunta
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
        const data = await FormService.getAllCompanies(); // <- esse método precisa existir
        setCompanies(data);
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

        // label primária da pergunta seja enviada
        const questionLabel = q.label || "";

        // filtra traduções vazias
        let filteredTranslations = q.translations.filter(
          (t) => t.language && t.label
        );

        // garante que a tradução para o idioma principal do formulário esteja presente
        // se o idioma principal do formulário (formData.language) não tiver uma tradução explícita
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

        // se não houver traduções e houver uma label primária, cria uma tradução padrão
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
          // garante que a propriedade 'label' da pergunta seja enviada
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
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h5" component="h2" align="center" mb={4}>
        {isNewForm ? "Novo formulário" : `Editar Formulário: ${formData.name}`}
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
            <FormGroup row>
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
                label="Ativo (Publicamente visível)"
              />
            </FormGroup>
          </Grid>
        </Grid>

        <Typography variant="h5" component="h3" mt={4} mb={2}>
          Perguntas
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
                      label="Opções (separados por vírgula)"
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
                      label="Não utilizei este serviço"
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
                    Traduções
                  </Typography>
                  <Button
                    onClick={() => addTranslation(index)}
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Adicionar Tradução
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
        >
          {isNewForm ? "Criar Formulário" : "Salvar Mudanças"}
        </Button>
      </Box>
    </Container>
  );
};

export default FormEditorPage;
