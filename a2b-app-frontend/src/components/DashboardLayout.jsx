// src/components/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@mui/material/Button'; // For Logout button
import CircularProgress from '@mui/material/CircularProgress'; // Added for loadingAuthState

// Import navigation list items and icons
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart'; // For Predictions
import NewspaperIcon from '@mui/icons-material/Newspaper'; // For News
import PersonIcon from '@mui/icons-material/Person'; // For My Team / Manager Info
import CakeIcon from '@mui/icons-material/Cake'; // For Birthday Page

// Import AuthContext hook
import { useAuth } from '../context/AuthContext.jsx'; // Adjust path as needed

// Path to your logo in the public folder
const logoPath = "/icons/repa-logo.svg"; // Ensure this path is correct

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Karl Nuyda - FPL Assistant
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240; // Width of the sidebar drawer

// Styled AppBar component (from MUI dashboard template)
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Styled Drawer component (from MUI dashboard template)
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative', // Important for layout within the flex container
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7), // Width when closed (icon only)
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9), // Slightly wider on small screens and up when closed
        },
      }),
    },
  }),
);

export default function DashboardLayout() {
  const [open, setOpen] = useState(true); // Drawer open state
  const { user, logout, loadingAuthState } = useAuth(); // Get user, logout, and loading state
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active navigation link

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };
  
  // Determine if the special birthday link should be shown
  const isUserA = user?.isSpecialUserA === true;

  // Define navigation list items
  const mainListItems = (
    <React.Fragment>
      <ListItemButton component={RouterLink} to="/dashboard" selected={location.pathname === '/dashboard' || location.pathname === '/'}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/predictions" selected={location.pathname === '/predictions'}>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/news" selected={location.pathname === '/news'}>
        <ListItemIcon>
          <NewspaperIcon />
        </ListItemIcon>
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/manager-info" selected={location.pathname === '/manager-info'}>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
      </ListItemButton>
      {isUserA && (
        <ListItemButton component={RouterLink} to="/birthday-greeting-a" selected={location.pathname === '/birthday-greeting-a'}>
          <ListItemIcon>
            <CakeIcon />
          </ListItemIcon>
        </ListItemButton>
      )}
    </React.Fragment>
  );
  
  // Optional secondary list items
  // const secondaryListItems = ( ... );

  // Show a loading indicator while auth state is being determined
  if (loadingAuthState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Ensures consistent baseline styling */}
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: '24px', // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }), // Hide when drawer is open
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo in AppBar */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src={logoPath} alt="FPL Assistant Logo" style={{ height: '40px' }} />
            {/* Optional: Title next to logo */}
            {/* <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ ml: 2 }}>
              FPL Assistant
            </Typography> */}
          </Box>

          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user ? `Hi, ${user.username}` : ''}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          {open && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto', pl: 1 }}>
              <Typography variant="h6" component="div" noWrap>
                Menu
              </Typography>
            </Box>
          )}
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          {mainListItems}
          {/* <Divider sx={{ my: 1 }} /> */}
          {/* {secondaryListItems} */}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* Necessary to offset content below the AppBar */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Outlet renders the component for the matched child route */}
          <Outlet />
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
    </Box>
  );
}
