// src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'; // Assuming AuthContext.jsx
import { registerUser } from '../services/apiService'; // Adjust path as needed

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

// Styled components from the template
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
    width: '450px',
  },
  ...(theme.palette.mode === 'dark' && {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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
    <Typography variant="body2" color="text.secondary" align="center" {...props} sx={{pt: 2}}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Karl Nuyda
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fplTeamId: '', // Will be treated as required
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword, fplTeamId } = formData;

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

    if (!username.trim() || username.length < 3) {
      tempErrors.username = 'Username must be at least 3 characters long.';
      isValid = false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }
    if (!password || password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }
    // FPL Team ID is now required and must be a number
    if (!fplTeamId.trim()) {
        tempErrors.fplTeamId = 'FPL Team ID is required.';
        isValid = false;
    } else if (!/^\d+$/.test(fplTeamId)) {
        tempErrors.fplTeamId = 'FPL Team ID must be a number.';
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
      const userDataToSubmit = {
        username,
        email,
        password,
        fplTeamId: Number(fplTeamId), // Now always present and converted to Number
      };
      const registeredUserData = await registerUser(userDataToSubmit);
      login(registeredUserData);
      navigate('/predictions'); // Or to dashboard
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2}}>
            <Avatar sx={{ m: 1, bgcolor: 'transparent', width: 220, height: 112, p: 0 }}> {/* p:0 to remove padding if img fills it */}
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
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <FormControl error={!!errors.username}>
              <FormLabel htmlFor="username" sx={{textAlign: 'left'}}> Manager Username</FormLabel>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                value={username}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.username}
                helperText={errors.username}
              />
            </FormControl>

            <FormControl error={!!errors.email}>
              <FormLabel htmlFor="email" sx={{textAlign: 'left'}}>Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                variant="outlined"
                value={email}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            <FormControl error={!!errors.password}>
              <FormLabel htmlFor="password" sx={{textAlign: 'left'}}>Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••••••••••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                value={password}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password}
              />
            </FormControl>

            <FormControl error={!!errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword" sx={{textAlign: 'left'}}>Confirm Password</FormLabel>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                placeholder="••••••••••••••••••"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                variant="outlined"
                value={confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </FormControl>

            <FormControl error={!!errors.fplTeamId}>
              <FormLabel htmlFor="fplTeamId" sx={{textAlign: 'left'}}>FPL Team ID</FormLabel>
              <TextField
                required // Added required prop
                name="fplTeamId"
                fullWidth
                id="fplTeamId"
                variant="outlined"
                value={fplTeamId}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.fplTeamId}
                type="number"
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign up'}
            </Button>
          </Box>
          <Typography sx={{ textAlign: 'center', mt:1 }}>
            <Link component={RouterLink} to="/login" variant="body2" sx={{ alignSelf: 'center' }}>
              EXISTING ACCOUNT SIGN IN
            </Link>
          </Typography>
        </Card>
        <Copyright />
      </SignUpContainer>
    </>
  );
}


