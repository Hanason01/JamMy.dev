import { createTheme, ThemeOptions} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeText {
    hint: string;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    primary: true;
    secondary: true;
  }
}

const theme: ThemeOptions = createTheme({
  palette: {
    primary: {
      light: '#7986CB',
      main: '#3F51B5',
      dark: '#303F9F',
      contrastText: '#FAFAFA'
    },
    secondary: {
      light: '#FFECB3',
      main: '#FFC107',
      dark: '#FFA000',
      contrastText: '#FAFAFA'
    },
    text: {
      primary: '#494848',
      secondary: '#757575',
      disabled: '#BDBDBD',
      hint: '#9E9E9E'
    },
    divider:'#BDBDBD',
    background: {
      default: '#FAFAFA',
      // paper: 'rgba(121, 134, 203, 0.1)'
    },
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'primary' },  // カスタムバリアントの名前
          style: {
            backgroundColor: '#3F51B5',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '10px 20px',
            '&:hover': {
              backgroundColor: '#303F9F',
            },
          },
        },
        {
          props: { variant: 'secondary' },  // 別のカスタムバリアント
          style: {
            backgroundColor: '#FAFAFA',
            color: '#3F51B5',
            border: '1px solid #7986CB',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#FFECB3',
            },
          },
        },
      ],
    },
  },
});
export default theme;