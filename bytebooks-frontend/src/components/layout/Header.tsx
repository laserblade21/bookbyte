// File: src/components/layout/Header.tsx

import React from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Container, Box, Avatar, Menu, MenuItem,
  useMediaQuery, useTheme, InputBase
} from '@mui/material';
import { 
  Menu as MenuIcon, Search as SearchIcon, 
  AccountCircle, ShoppingCart, Bookmark
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = (e.target as HTMLFormElement).querySelector('input')?.value;
    if (searchInput) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };
  
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isDesktop && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Book Byte
            </Typography>
          </Box>
          
          {isDesktop && (
            <Box sx={{ display: 'flex', flexGrow: 1, mx: 4 }}>
              <Button color="inherit" component={Link} to="/search?category=fiction">Fiction</Button>
              <Button color="inherit" component={Link} to="/search?category=science">Science</Button>
              <Button color="inherit" component={Link} to="/search?category=kids">Kids</Button>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ 
                position: 'relative', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                width: { xs: 140, sm: 200 }
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center',
                  pl: 1
                }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search…"
                  sx={{
                    color: 'inherit',
                    pl: 4,
                    pr: 1,
                    py: 1,
                    width: '100%'
                  }}
                />
              </Box>
            </form>
            
            <IconButton color="inherit" component={Link} to="/cart">
              <ShoppingCart />
            </IconButton>
            
            {isAuthenticated ? (
              <>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleUserMenuOpen}
                  color="inherit"
                >
                  <Avatar 
                    sx={{ width: 32, height: 32 }}
                    alt={user?.name || 'User'} 
                  />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={userMenuAnchor}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={handleUserMenuClose}>
                    Orders
                  </MenuItem>
                  <MenuItem component={Link} to="/saved" onClick={handleUserMenuClose}>
                    Saved Books
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;