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
} from "@mui/material";

import { styled } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import PropTypes from "prop-types";

import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

// === carinhas ===
const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: theme.palette.action.disabled,
  },
}));

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60 }} color="error" />,
    label: "Muito insatisfeito",
  },
  2: {
    icon: <SentimentDissatisfiedIcon sx={{ fontSize: 60 }} color="error" />,
    label: "Insatisfeito",
  },
  3: {
    icon: <SentimentSatisfiedIcon sx={{ fontSize: 60 }} color="warning" />,
    label: "Neutro",
  },
  4: {
    icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 60 }} color="success" />,
    label: "Satisfeito",
  },
  5: {
    icon: <SentimentVerySatisfiedIcon sx={{ fontSize: 60 }} color="success" />,
    label: "Muito satisfeito",
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}
IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
};

// === componente principal ===
const QuestionComponent = ({ question, value, onChange, isSectionDenied, language }) => {
  if (isSectionDenied) {
    return null;
  }

  const questionType = question.type;

  let translatedLabel = "Questão sem label";

  const translatedLabelObject = question.translations?.find(
    (t) => t.language === language
  );
  if (translatedLabelObject) {
    translatedLabel = translatedLabelObject.label;
  } else if (question.label) {
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
            <StyledRating
              name={`rating-question-${question.id}`}
              value={Number(value) || 0}
              onChange={(event, newValue) => handleRatingChange(event, newValue)}
              IconContainerComponent={IconContainer}
              getLabelText={(val) => customIcons[val].label}
              highlightSelectedOnly
              max={maxRating}
              sx={{ fontSize: 60 }}
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
