import React from "react";
import { useTranslation } from "react-i18next";
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

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';


import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: theme.palette.action.disabled,
  }
}));

const emojiIcons = (t) => ({//todo color amarelo
  1: { icon: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60 }} color="error" />, label: t("sentiment_1") },
  2: { icon: <SentimentDissatisfiedIcon sx={{ fontSize: 60 }} color="error" />, label: t("sentiment_2") },
  3: { icon: <SentimentSatisfiedIcon sx={{ fontSize: 60 }} color="warning" />, label: t("sentiment_3") },
  4: { icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 60 }} color="success" />, label: t("sentiment_4") },
  5: { icon: <SentimentVerySatisfiedIcon sx={{ fontSize: 60 }} color="success" />, label: t("sentiment_5") },
});

const starIcons = (t) => ({
  1: { icon: <StarIcon sx={{ fontSize: 60, color: '#fff00' }}/>, label: t("sentiment_1") },
  2: { icon: <StarIcon sx={{ fontSize: 60, color: '#fff00' }} />, label: t("sentiment_2") },
  3: { icon: <StarIcon sx={{ fontSize: 60, color: '#fff00' }} />, label: t("sentiment_3") },
  4: { icon: <StarIcon sx={{ fontSize: 60, color: '#fff00' }} />, label: t("sentiment_4") },
  5: { icon: <StarIcon sx={{ fontSize: 60, color: '#fff00' }} />, label: t("sentiment_5") },
});

const heartIcons = (t) => ({
  1: { icon: <FavoriteIcon sx={{ fontSize: 60, color: '#ff6d75' }} />, label: t("sentiment_1") },
  2: { icon: <FavoriteIcon sx={{ fontSize: 60, color: '#ff6d75' }} />, label: t("sentiment_2") },
  3: { icon: <FavoriteIcon sx={{ fontSize: 60, color: '#ff6d75' }} />, label: t("sentiment_3") },
  4: { icon: <FavoriteIcon sx={{ fontSize: 60, color: '#ff6d75' }} />, label: t("sentiment_4") },
  5: { icon: <FavoriteIcon sx={{ fontSize: 60, color: '#ff6d75' }} />, label: t("sentiment_5") },
});


const iconMap = (t) => ({
  EMOJIS: {
    customIcons: emojiIcons(t),
    emptyIcon: <SentimentSatisfiedIcon sx={{ fontSize: 60, color: 'action.disabled' }} />,
  },
  STARS: {
    customIcons: starIcons(t),
    emptyIcon: <StarBorderIcon sx={{ fontSize: 60 }} />,
  },
  HEARTS: {
    customIcons: heartIcons(t),
    emptyIcon: <FavoriteBorderIcon sx={{ fontSize: 60 }} />,
  },
  DEFAULT: {
    customIcons: starIcons(t),
    emptyIcon: <StarBorderIcon sx={{ fontSize: 60 }} />,
  }
});

function IconContainer(props) {
  const { value, ...other } = props;

  const iconToRender = props.icons[value] ? props.icons[value].icon : <StarBorderIcon sx={{ fontSize: 60 }} />;

  return <span {...other}>{iconToRender}</span>;
}

IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
  icons: PropTypes.object.isRequired,
};

const QuestionComponent = ({ question, value, onChange, isSectionDenied, language }) => {
  const { t } = useTranslation();

  if (isSectionDenied) {
    return null;
  }

  const questionType = question.type;

  let translatedLabel = t("noLabelQuestion");

  const translatedLabelObject = question.translations?.find(
    (t) => t.language === language
  );
  if (translatedLabelObject) {
    translatedLabel = translatedLabelObject.label;
  } else if (question.label) {
    translatedLabel = question.label;
  }

  const options = question.options || [];



  const selectedType = question.displayType?.toUpperCase() || "STARS";
  const iconConfig = iconMap(t)[selectedType] || iconMap(t)['DEFAULT'];
  const currentCustomIcons = iconConfig.customIcons;

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
            placeholder={t("placeholder_text")}
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
              {t("placeholder_select")}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <IconButton
              color={value === "true" ? "success" : "default"}
              onClick={() => onChange("true")}
              size="small"
              aria-label={t("yes")}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton
              color={value === "false" ? "error" : "default"}
              onClick={() => onChange("false")}
              size="small"
              aria-label={t("no")}
            >
              <CancelOutlinedIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
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
              IconContainerComponent={(props) => <IconContainer {...props} icons={currentCustomIcons} />}
              emptyIcon={iconConfig.emptyIcon}
              getLabelText={(val) => currentCustomIcons[val].label}
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
            {t("unknownQuestionType")}
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