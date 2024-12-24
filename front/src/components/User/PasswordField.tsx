"use client";

import { FormControl, OutlinedInput, InputLabel, InputAdornment, IconButton, FormHelperText } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export function PasswordField({
  label,
  placeholder,
  showPassword,
  onToggleVisibility,
  error,
  helperText,
  ...props
} : {
  label: string;
  placeholder?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: boolean;
  helperText?: string;
  [key: string]: any;
}) {
  return (
    <FormControl variant="outlined" fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
              onClick={onToggleVisibility}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
        {...props}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}