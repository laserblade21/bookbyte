import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon, 
  Psychology as PsychologyIcon,
  Style as StyleIcon,
  Group as GroupIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { getBookInsights } from '../../services/aiService';
import { Book } from '../../utils/bookUtils';

interface BookInsightsProps {
  book: Book;
}

interface Insights {
  themes?: string[];
  writingStyle?: string;
  audience?: string;
  similarBooks?: Array<{title: string, author: string}>;
  rawResponse?: string;
  error?: string;
}

const BookInsights: React.FC<BookInsightsProps> = ({ book }) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getBookInsights(book);
      
      if (response.error) {
        setError(response.error);
        setInsights(null);
      } else if (response.rawResponse) {
        // Handle non-JSON response
        setInsights({
          rawResponse: response.rawResponse
        });
      } else {
        // Handle properly formatted JSON response
        setInsights({
          themes: response.themes || [],
          writingStyle: response.writingStyle || '',
          audience: response.whoWouldEnjoyThis || response.audience || '',
          similarBooks: response.similarBooks || []
        });
      }
    } catch (error) {
      console.error('Error fetching book insights:', error);
      setError('Failed to generate insights for this book.');
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchInsights();
  }, [book.id]); // Re-fetch when book ID changes
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3" fontWeight="bold">
          AI Book Insights
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : insights ? (
        <Box>
          {insights.rawResponse ? (
            // Display unstructured response as is
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {insights.rawResponse}
            </Typography>
          ) : (
            // Display structured insights
            <>
              {/* Themes */}
              {insights.themes && insights.themes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PsychologyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Main Themes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {insights.themes.map((theme, index) => (
                      <Chip 
                        key={index} 
                        label={theme} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Writing Style */}
              {insights.writingStyle && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StyleIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Writing Style
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {insights.writingStyle}
                  </Typography>
                </Box>
              )}
              
              {/* Target Audience */}
              {insights.audience && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Who Would Enjoy This Book
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {insights.audience}
                  </Typography>
                </Box>
              )}
              
              {/* Similar Books */}
              {insights.similarBooks && insights.similarBooks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MenuBookIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Similar Books
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    {insights.similarBooks.map((book, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={book.title} 
                          secondary={book.author ? `by ${book.author}` : undefined}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontWeight: 'medium' 
                          }}
                          secondaryTypographyProps={{ 
                            variant: 'body2'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              size="small" 
              onClick={fetchInsights}
              disabled={loading}
            >
              Refresh Insights
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No insights available for this book.
        </Typography>
      )}
    </Paper>
  );
};

export default BookInsights;