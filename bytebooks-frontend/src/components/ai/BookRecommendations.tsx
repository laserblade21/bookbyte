import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { 
  Psychology as PsychologyIcon, 
  Recommend as RecommendIcon 
} from '@mui/icons-material';
import { getAIBookRecommendations } from '../../services/aiService';
import { Book } from '../../utils/bookUtils';
import BookCard from '../books/BookCard';
import * as apiService from '../../services/apiService';

const SAMPLE_PREFERENCES = [
  "Science fiction with strong female characters",
  "Historical fiction set in ancient Rome",
  "Fantasy books similar to Lord of the Rings",
  "Non-fiction about space exploration",
  "Mystery novels with surprising twists",
  "Self-improvement books focused on productivity",
  "Romance novels with happy endings",
  "Classic literature from the 19th century"
];

const BookRecommendations: React.FC = () => {
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [error, setError] = useState('');
  const [fetchedBooks, setFetchedBooks] = useState(false);

 
  const fetchBooksIfNeeded = async () => {
    if (allBooks.length === 0 && !fetchedBooks) {
      setFetchedBooks(true); 
      try {
    
        const categories = ['fiction', 'science', 'fantasy', 'mystery', 'history', 'biography'];
        const booksMap = await apiService.getBooksByCategories(categories);
        
        // Combine all books into one array
        const combinedBooks: Book[] = [];
        for (const category in booksMap) {
          if (booksMap[category]) {
            combinedBooks.push(...booksMap[category]);
          }
        }
        
        setAllBooks(combinedBooks);
        return combinedBooks;
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to fetch books for recommendations.');
        return [];
      }
    }
    return allBooks;
  };

  // Handle selecting a sample preference
  const handleSelectPreference = (preference: string) => {
    setPreferences(preference);
  };

  // Get recommendations based on preferences
  const handleGetRecommendations = async () => {
    if (!preferences.trim()) {
      setError('Please enter your reading preferences.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
    
      const books = await fetchBooksIfNeeded();
      
      if (books.length === 0) {
        setError('No books available for recommendations.');
        setLoading(false);
        return;
      }
      
      const recommendations = await getAIBookRecommendations(preferences, books);
      
      if (recommendations.length === 0) {
        setError('Could not find recommendations matching your preferences. Please try different preferences.');
      } else {
        setRecommendedBooks(recommendations);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PsychologyIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h5" component="h2" fontWeight="bold">
          AI Book Recommendations
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Tell us about your reading preferences, and our AI will recommend books just for you.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Your Reading Preferences"
          placeholder="E.g., 'Science fiction with strong female characters' or 'Books about ancient history'"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          multiline
          rows={2}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetRecommendations}
            disabled={loading || !preferences.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <RecommendIcon />}
          >
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 1, sm: 0 } }}>
            Or try one of these:
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {SAMPLE_PREFERENCES.map((preference, index) => (
          <Chip
            key={index}
            label={preference}
            onClick={() => handleSelectPreference(preference)}
            color="primary"
            variant="outlined"
            clickable
          />
        ))}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {recommendedBooks.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" component="h3" gutterBottom>
            Your Personalized Recommendations
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Based on: "{preferences}"
          </Typography>
          
          <Grid container spacing={3}>
            {recommendedBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  imageUrl={book.imageUrl}
                  price={book.price}
                  openLibraryKey={book.openLibraryKey}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default BookRecommendations;