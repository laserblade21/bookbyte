// File: src/components/layout/Footer.tsx

import React from 'react';
import { Container, Grid, Typography, Link as MuiLink, Box, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" component="div" gutterBottom>
              Book Byte
            </Typography>
            <Typography variant="body2">
              Your one-stop shop for all kinds of books.
              Discover new authors, explore different genres,
              and find your next great read.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="YouTube">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Categories
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/search?category=fiction" 
                  color="inherit" 
                  underline="hover"
                >
                  Fiction
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/search?category=science" 
                  color="inherit"
                  underline="hover"
                >
                  Science
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/search?category=kids" 
                  color="inherit"
                  underline="hover"
                >
                  Kids
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/search?category=history" 
                  color="inherit"
                  underline="hover"
                >
                  History
                </MuiLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Help
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/support" 
                  color="inherit"
                  underline="hover"
                >
                  Customer Support
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/shipping" 
                  color="inherit"
                  underline="hover"
                >
                  Shipping Info
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/returns" 
                  color="inherit"
                  underline="hover"
                >
                  Returns & Refunds
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/faq" 
                  color="inherit"
                  underline="hover"
                >
                  FAQ
                </MuiLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/about" 
                  color="inherit"
                  underline="hover"
                >
                  About Us
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/careers" 
                  color="inherit"
                  underline="hover"
                >
                  Careers
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/terms" 
                  color="inherit"
                  underline="hover"
                >
                  Terms of Service
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/privacy" 
                  color="inherit"
                  underline="hover"
                >
                  Privacy Policy
                </MuiLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Account
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/login" 
                  color="inherit"
                  underline="hover"
                >
                  Sign In
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/register" 
                  color="inherit"
                  underline="hover"
                >
                  Register
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/orders" 
                  color="inherit"
                  underline="hover"
                >
                  My Orders
                </MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink 
                  component={RouterLink} 
                  to="/saved" 
                  color="inherit"
                  underline="hover"
                >
                  Saved Books
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Book Byte. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;