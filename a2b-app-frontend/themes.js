// src/theme.js
import { createTheme, alpha } from '@mui/material/styles'; // Import alpha for generating light/dark shades if needed
import { red, grey, common } from '@mui/material/colors'; // Keep other color imports

// Your new primary color
const pastelBlue = '#A7C7E7';

// Define your color palette
const updatedPalette = {
  primary: {
    main: pastelBlue,
    // MUI will attempt to calculate light and dark shades from main.
    // If you want more control, you can define them explicitly:
    // light: alpha(pastelBlue, 0.5), // Example: 50% lighter version
    // dark: alpha(pastelBlue, 0.9),  // Example: 10% darker (towards 1.0 opacity)
    // Or use a color manipulation library or online tool to pick specific shades.
    contrastText: grey[900], // Pastel blue is light, so dark text is needed for contrast
  },
  secondary: { // Kept the previous secondary for now, you might want to adjust this too
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
  // You can also define warning, info, success if needed
  // warning: { main: amber[700] },
  // info: { main: blue[700] },
  // success: { main: green[700] },

  // Example for difficulty colors in UpcomingFixturesWidget
  difficulty: {
    1: '#4caf50', // green
    2: '#8bc34a', // light green
    3: '#ffeb3b', // yellow (might need darker text on this)
    4: '#ff9800', // orange
    5: '#f44336', // red
  },
};

// Create the theme instance
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
    // Define other typography variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // textTransform: 'none', // Example: To prevent ALL CAPS on buttons
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
    // Add other component overrides
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
