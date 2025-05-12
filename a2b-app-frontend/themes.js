import { createTheme, alpha } from '@mui/material/styles'; 
import { red, grey, common } from '@mui/material/colors'; 

const pastelBlue = '#A7C7E7';
const updatedPalette = {
  primary: {
    main: pastelBlue,
    contrastText: grey[900],
  },
  secondary: {
    main: grey[800],
    light: grey[700],
    dark: grey[900],
    contrastText: common.white,
  },
  background: {
    default: grey[100],
    paper: common.white,
  },
  text: {
    primary: grey[900],
    secondary: grey[700],
  },
  error: {
    main: red[700],
  },
  difficulty: {
    1: '#4caf50', 
    2: '#8bc34a', 
    3: '#ffeb3b', 
    4: '#ff9800', 
    5: '#f44336', 
  },
};
const theme = createTheme({
  palette: updatedPalette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '12px', 
                boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', 
            }
        }
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
