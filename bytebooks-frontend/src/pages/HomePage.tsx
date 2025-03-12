// src/pages/HomePage.tsx with AI Recommendations section
import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Grid, Box, CircularProgress, Alert, Paper, Button, Card,
  CardContent, useMediaQuery, useTheme, Divider, IconButton, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  ArrowForward, ChevronLeft, ChevronRight, AutoStories, Science, Psychology, History, 
  Brush, Code, Restaurant, FitnessCenter, ChildCare 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/books/BookCard';
import { getAllBooks, getBooksByCategory } from '../services/apiService';
import type { Book } from '../utils/bookUtils';
import { useAuth } from '../context/AuthContext';
import BookRecommendations from '../components/ai/BookRecommendations'; 

const categories = [
  { name: 'Fiction', icon: <AutoStories />, color: '#3f51b5' },
  { name: 'Science', icon: <Science />, color: '#2196f3' },
  { name: 'Psychology', icon: <Psychology />, color: '#9c27b0' },
  { name: 'History', icon: <History />, color: '#f44336' },
  { name: 'Art', icon: <Brush />, color: '#ff9800' },
  { name: 'Technology', icon: <Code />, color: '#4caf50' },
  { name: 'Cooking', icon: <Restaurant />, color: '#795548' },
  { name: 'Health', icon: <FitnessCenter />, color: '#009688' },
  { name: 'Kids', icon: <ChildCare />, color: '#ff4081' }
];

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  useAuth();
  
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [fictionBooks, setFictionBooks] = useState<Book[]>([]);
  const [scienceBooks, setScienceBooks] = useState<Book[]>([]);
  const [kidsBooks, setKidsBooks] = useState<Book[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>('all');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const booksPerRow = isMobile ? 1 : isTablet ? 2 : 4;
  const visibleFeaturedBooks = featuredBooks.slice(carouselIndex, carouselIndex + booksPerRow);

  const nextCarouselSlide = () => {
    if (carouselIndex + booksPerRow < featuredBooks.length) {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const prevCarouselSlide = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Fix: Use the lowercase category name for URL
    navigate(`/search?category=${encodeURIComponent(categoryName.toLowerCase())}`);
  };

  useEffect(() => {
    // Check localStorage for cached data first to avoid loading state flicker
    try {
      const cache = localStorage.getItem('bookByteHomeCache');
      if (cache) {
        const data = JSON.parse(cache);
        const timestamp = data.timestamp || 0;
        
        // Only use cache if it's less than 1 hour old
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          console.log('Using cached home page data');
          setFeaturedBooks(data.featuredBooks || []);
          setFictionBooks(data.fictionBooks || []);
          setScienceBooks(data.scienceBooks || []);
          setKidsBooks(data.kidsBooks || []);
          setLoading(false);
          setInitialLoadDone(true);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    
    // Only fetch data if not already loaded
    if (!initialLoadDone) {
      fetchBooks();
    }
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use Promise.allSettled to ensure all promises complete, even if some fail
      const results = await Promise.allSettled([
        getAllBooks(0, 8), // For featured books
        getBooksByCategory('fiction', 0, 8),
        getBooksByCategory('science', 0, 8),
        getBooksByCategory('kids', 0, 8)
      ]);

      // Process results with fallbacks for failures
      const [featuredResult, fictionResult, scienceResult, kidsResult] = results;
      
      const featured = featuredResult.status === 'fulfilled' 
        ? featuredResult.value.books || []
        : [];
      
      const fiction = fictionResult.status === 'fulfilled' 
        ? fictionResult.value.items || []
        : [];
      
      const science = scienceResult.status === 'fulfilled' 
        ? scienceResult.value.items || []
        : [];
      
      const kids = kidsResult.status === 'fulfilled' 
        ? kidsResult.value.items || []
        : [];
      
      setFeaturedBooks(featured);
      setFictionBooks(fiction);
      setScienceBooks(science);
      setKidsBooks(kids);

      // Cache the data in localStorage for faster loading next time
      try {
        localStorage.setItem('bookByteHomeCache', JSON.stringify({
          featuredBooks: featured,
          fictionBooks: fiction,
          scienceBooks: science,
          kidsBooks: kids,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error caching home data:', e);
      }

      // Check if all requests failed
      if (results.every(result => result.status === 'rejected')) {
        setError('Failed to load books. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  // Filter kids books by age group
  const filteredKidsBooks = kidsBooks
    .filter(book => ageGroup === 'all' || book.ageGroup === ageGroup)
    .slice(0, 4);

  return (
    <Box>
      {/* Hero Banner */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'primary.dark',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?books)',
          height: { xs: '300px', md: '400px' },
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Discover Your Next Great Read
              </Typography>
              <Typography variant="h6" color="inherit" paragraph>
                Explore thousands of books with AI-powered recommendations tailored just for you.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                component={Link} 
                to="/search"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
              >
                Explore Books
              </Button>
            </Box>
          </Container>
        </Box>
      </Paper>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* AI Book Recommendations - New Section */}
            <Box sx={{ mb: 8 }}>
              <BookRecommendations />
            </Box>
          
            {/* Featured Books Carousel */}
            {featuredBooks.length > 0 && (
              <Box sx={{ mb: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Featured Books
                  </Typography>
                  <Box>
                    <IconButton 
                      onClick={prevCarouselSlide} 
                      disabled={carouselIndex === 0}
                      size="small"
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton 
                      onClick={nextCarouselSlide} 
                      disabled={carouselIndex + booksPerRow >= featuredBooks.length}
                      size="small"
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Grid container spacing={3}>
                    {visibleFeaturedBooks.map((book) => (
                      <Grid item xs={12} sm={6} md={3} key={book.id}>
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
                </Box>
              </Box>
            )}

            {/* Browse Categories */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                Browse Categories
              </Typography>
              <Grid container spacing={2}>
                {categories.map((category) => (
                  <Grid item xs={6} sm={4} md={3} key={category.name}>
                    <Card 
                      onClick={() => handleCategoryClick(category.name)}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        height: 80, 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: category.color,
                          color: 'white'
                        }}
                      >
                        {category.icon}
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle1" component="div">
                          {category.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Rest of the component remains the same */}
            {/* ... */}
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;