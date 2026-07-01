import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#4285F4' }, // Google Blue
    secondary: { main: '#DB4437' }, // Google Red
    success: { main: '#0F9D58' }, // Google Green
    warning: { main: '#F4B400' }, // Google Yellow
  },
  typography: {
    fontFamily: '"Inter", "Times New Roman", serif',
    h1: { fontFamily: '"Times New Roman", serif', fontWeight: 700 },
    h2: { fontFamily: '"Times New Roman", serif', fontWeight: 700 },
    h3: { fontFamily: '"Times New Roman", serif', fontWeight: 700 },
    // Custom style for prices to be used in MUI components
    subtitle1: { fontWeight: 400 }, 
    body1: { fontWeight: 400 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;