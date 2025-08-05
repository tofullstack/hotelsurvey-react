// QuestionComponent.js
import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Rating,
} from "@mui/material";

const QuestionComponent = ({ question, value, onChange, isSectionDenied, language }) => {
  if (isSectionDenied) {
    return null;
  }

  const questionType = question.type;

  let translatedLabel = "Questão sem label";

  // 1. Tentar encontrar a tradução no array 'translations' usando o idioma da URL
  const translatedLabelObject = question.translations?.find(t => t.language === language);
  if (translatedLabelObject) {
    translatedLabel = translatedLabelObject.label;
  }
  // 2. Se a tradução específica não for encontrada, usar a label direta como fallback
  else if (question.label) {
    translatedLabel = question.label;
  }

  const options = question.options || [];

  const renderInput = () => {
    switch (questionType?.toUpperCase()) {
      case "TEXT":
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite sua resposta..."
          />
        );
      case "CHOICE":
        return (
          <Select
            fullWidth
            variant="outlined"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione uma opção
            </MenuItem>
            {options.map((opt, index) => (
              <MenuItem key={index} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        );
      case "YES_NO":
        return (
          <RadioGroup
            row
            name={`question-${question.id}`}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{ gap: 4 }}
          >
            <FormControlLabel value="true" control={<Radio />} label="Sim" />
            <FormControlLabel value="false" control={<Radio />} label="Não" />
          </RadioGroup>
        );
      case "SCALE": {
        const maxRating =
          options.length > 0 ? parseInt(options[options.length - 1], 10) : 5;
        const handleRatingChange = (event, newValue) => {
          onChange(newValue ?? null);
        };
        return (
          <Box mt={1}>
            <Rating
              name={`rating-question-${question.id}`}
              value={Number(value) || 0}
              onChange={handleRatingChange}
              precision={1}
              max={maxRating}
            />
          </Box>
        );
      }
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Tipo de pergunta desconhecido.
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel
          component="legend"
          sx={{ mb: 1, fontWeight: "bold" }}
          title={translatedLabel}
        >
          {translatedLabel}
          {question.mandatory && (
            <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
              *
            </Box>
          )}
        </FormLabel>
        {renderInput()}
      </FormControl>
    </Box>
  );
};

export default QuestionComponent;