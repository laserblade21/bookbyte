
import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  // Mock order history for demo
  const orderHistory = [
    { id: 'ORD-1234', date: '2024-03-01', total: 45.97, status: 'Delivered' },
    { id: 'ORD-5678', date: '2024-02-15', total: 29.99, status: 'Shipped' },
    { id: 'ORD-9012', date: '2024-01-20', total: 64.50, status: 'Delivered' }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Account
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {auth.user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {auth.user?.email}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/profile/edit')}
              sx={{ mb: 1 }}
              fullWidth
            >
              Edit Profile
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
              fullWidth
            >
              Log Out
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order History
            </Typography>
            
            {orderHistory.length > 0 ? (
              <List>
                {orderHistory.map((order) => (
                  <React.Fragment key={order.id}>
                    <ListItem 
                      secondaryAction={
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            Order #{order.id}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {order.date} · ${order.total.toFixed(2)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              component="span" 
                              sx={{ 
                                ml: 2, 
                                color: order.status === 'Delivered' ? 'success.main' : 'info.main'
                              }}
                            >
                              {order.status}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                You haven't placed any orders yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;