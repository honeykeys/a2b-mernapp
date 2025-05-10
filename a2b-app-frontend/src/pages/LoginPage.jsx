import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'; // Assuming AuthContext.jsx
import { loginUser } from '../services/apiService'; // Adjust path as needed

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Import your custom SVG icon as a React component

// Styled components from the template (Card and SignInContainer)
// These are similar to the SignUpPage for consistency.
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px', // Max width for the card
  },
  ...(theme.palette.mode === 'dark' && {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - (var(--template-frame-height, 0))) * 100dvh)',
  minHeight: '100vh',
  width: '100vw',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...(theme.palette.mode === 'dark' && {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props} sx={{ pt: 2 }}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Karl Nuyda
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({}); // For field-specific errors
  const [formError, setFormError] = useState(''); // For general API errors
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setFormError('');
  };

  const validateInputs = () => {
    let tempErrors = {};
    let isValid = true;

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }
    if (!password) { // Basic check, length validation can be added if desired
      tempErrors.password = 'Password is required.';
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    try {
      const userData = await loginUser({ email, password });
      login(userData);
      navigate('/predictions'); // Or to dashboard
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: 'transparent', width: 220, height: 112 }}>
            <img 
                src="/icons/repa-logo.svg" // Path relative to the public folder
                alt="FPL Assistant Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
            </Avatar>
          </Box>

          {formError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate // Let our custom validation handle it
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2, // Spacing from template
            }}
          >
            <FormControl error={!!errors.email}>
              <FormLabel htmlFor="email" sx={{textAlign: 'left'}}>Email</FormLabel>
              <TextField
                error={!!errors.email}
                helperText={errors.email}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={handleChange}
                disabled={loading}
              />
            </FormControl>

            <FormControl error={!!errors.password}>
              <FormLabel htmlFor="password" sx={{textAlign: 'left'}}>Password</FormLabel>
              <TextField
                error={!!errors.password}
                helperText={errors.password}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={handleChange}
                disabled={loading}
              />
            </FormControl>
            
            {/* "Remember me" and "Forgot password" removed as per plan */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }} // Added some top margin
              disabled={loading}
              onClick={handleSubmit} // Changed from template's validateInputs
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
            </Button>
          </Box>

          {/* Social login buttons and "or" divider removed */}

          <Typography sx={{ textAlign: 'center', mt: 2 }}> {/* Adjusted margin */}
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" variant="body2" sx={{ alignSelf: 'center' }}>
              Sign up
            </Link>
          </Typography>
        </Card>
        <Copyright />
      </SignInContainer>
    </>
  );
}