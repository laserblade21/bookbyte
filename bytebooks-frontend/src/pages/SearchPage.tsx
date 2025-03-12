import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, Button, Paper, FormControl, 
  InputLabel, Select, MenuItem, TextField, InputAdornment, Divider,
  CircularProgress, Alert, Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { searchBooks, getBooksByCategory } from '../services/apiService';
import type { Book } from '../utils/bookUtils';
import BookCard from '../components/books/BookCard';

interface SearchParamsType {
  query: string;
  category: string;
  priceRange: string;
  sortBy: string;
  page: number;
}

// Debounce function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchParams, setSearchParams] = useState<SearchParamsType>({
    query: new URLSearchParams(location.search).get('q') || '',
    category: new URLSearchParams(location.search).get('category') || 'all',
    priceRange: new URLSearchParams(location.search).get('price') || 'all',
    sortBy: new URLSearchParams(location.search).get('sort') || 'relevance',
    page: parseInt(new URLSearchParams(location.search).get('page') || '1', 10),
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [isSearchInitialized, setIsSearchInitialized] = useState(false);

  const updateSearchParams = (newParams: Partial<SearchParamsType>) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  // Handle search function
  const handleSearch = async (resetPage = false) => {
    if (resetPage && searchParams.page !== 1) {
      updateSearchParams({ page: 1 });
    }

    const currentQuery = searchInputRef.current?.value?.trim() || searchParams.query;

    if (currentQuery !== searchParams.query) {
      updateSearchParams({ query: currentQuery });
    }

    if (!currentQuery && searchParams.category === 'all') {
      setError('Please enter a search term or select a category');
      return;
    }

    setLoading(true);
    if (error) setError('');

    try {
      let response;
      
      if (searchParams.category !== 'all') {
        
        response = await getBooksByCategory(
          searchParams.category,
          searchParams.page - 1, // Spring Boot pages are 0-based
          10
        );
        
        if (response.items && response.items.length > 0) {
          setBooks(response.items);
          setTotalResults(response.items.length); // Estimate total or use total if available
        } else {
          setBooks([]);
          setTotalResults(0);
          setError('No books found in this category.');
        }
      } else {
        // Otherwise use text search
        const apiResponse = await searchBooks(
          currentQuery,
          searchParams.page - 1, 
          10
        );
        
        if (apiResponse.books && apiResponse.books.length > 0) {
          setBooks(apiResponse.books);
          setTotalResults(apiResponse.totalItems);
        } else {
          setBooks([]);
          setTotalResults(0);
          setError('No books found matching your search.');
        }
      }
    } catch (err) {
      console.error('Error searching books:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (searchParams.query) params.set('q', searchParams.query);
    if (searchParams.page > 1) params.set('page', searchParams.page.toString());
    if (searchParams.category !== 'all') params.set('category', searchParams.category);
    if (searchParams.priceRange !== 'all') params.set('price', searchParams.priceRange);
    if (searchParams.sortBy !== 'relevance') params.set('sort', searchParams.sortBy);
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      handleSearch();
    }, 500);

    if (isSearchInitialized) {
      debouncedSearch();
    }
  }, [searchParams, isSearchInitialized]);

  // Perform initial search when URL params change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlQuery = queryParams.get('q') || '';
    const urlCategory = queryParams.get('category') || 'all';
    const urlPrice = queryParams.get('price') || 'all';
    const urlSort = queryParams.get('sort') || 'relevance';
    const urlPage = parseInt(queryParams.get('page') || '1', 10);

    const paramsChanged = 
      urlQuery !== searchParams.query ||
      urlCategory !== searchParams.category ||
      urlPrice !== searchParams.priceRange ||
      urlSort !== searchParams.sortBy ||
      urlPage !== searchParams.page;

    if (paramsChanged) {
      setSearchParams({
        query: urlQuery,
        category: urlCategory,
        priceRange: urlPrice,
        sortBy: urlSort,
        page: urlPage,
      });

      if (!loading) {
        handleSearch(false);
        setIsSearchInitialized(true);
      }
    }
  }, [location.search, searchParams.category, searchParams.query, searchParams.page, searchParams.priceRange, searchParams.sortBy, loading]);

  // Force an initial search if there's a category in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
      console.log('Initial category detected:', categoryParam);
      setSearchParams(prev => ({
        ...prev,
        category: categoryParam
      }));
      
      // Force a search with this category
      setTimeout(() => {
        setLoading(true);
        getBooksByCategory(categoryParam, 0, 10)
          .then(response => {
            if (response.items?.length) {
              setBooks(response.items);
              setTotalResults(response.items.length);
            } else {
              setBooks([]);
              setError('No books found for this category.');
            }
          })
          .catch(err => {
            console.error('Error searching books:', err);
            setError('An error occurred while searching. Please try again.');
          })
          .finally(() => {
            setLoading(false);
            setIsSearchInitialized(true);
          });
      }, 100);
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Handle pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    updateSearchParams({ page: value });
    const params = new URLSearchParams(location.search);
    params.set('page', value.toString());
    navigate(`/search?${params.toString()}`);
  };

  // Filter books by price range
  const filteredBooks = useMemo(() => books
    .filter(book => {
      switch (searchParams.priceRange) {
        case 'under5': return book.price < 5;
        case '5to10': return book.price >= 5 && book.price <= 10;
        case '10to20': return book.price > 10 && book.price <= 20;
        case 'over20': return book.price > 20;
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (searchParams.sortBy) {
        case 'newest': 
          const yearA = a.publicationYear || 0;
          const yearB = b.publicationYear || 0;
          return yearB - yearA;
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'titleAsc': return a.title.localeCompare(b.title);
        default: return 0;
      }
    }), [books, searchParams.priceRange, searchParams.sortBy]);

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / 10);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {searchParams.category !== 'all' 
          ? `Browse ${searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)} Books`
          : 'Search Books'}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              inputRef={searchInputRef}
              defaultValue={searchParams.query}
              placeholder="Search by title, author, or ISBN"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(true);
                  updateQueryParams();
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={searchParams.category}
                onChange={(e) => {
                  updateSearchParams({ category: e.target.value as string, page: 1 });
                  setTimeout(updateQueryParams, 100);
                }}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="fiction">Fiction</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="history">History</MenuItem>
                <MenuItem value="biography">Biography</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="cooking">Cooking</MenuItem>
                <MenuItem value="art">Art</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="kids">Kids</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="price-label">Price</InputLabel>
              <Select
                labelId="price-label"
                id="price-select"
                value={searchParams.priceRange}
                onChange={(e) => {
                  updateSearchParams({ priceRange: e.target.value as string });
                  setTimeout(updateQueryParams, 100);
                }}
                label="Price"
              >
                <MenuItem value="all">Any Price</MenuItem>
                <MenuItem value="under5">Under $5</MenuItem>
                <MenuItem value="5to10">$5 to $10</MenuItem>
                <MenuItem value="10to20">$10 to $20</MenuItem>
                <MenuItem value="over20">Over $20</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                value={searchParams.sortBy}
                onChange={(e) => {
                  updateSearchParams({ sortBy: e.target.value as string });
                  setTimeout(updateQueryParams, 100);
                }}
                label="Sort By"
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                <MenuItem value="titleAsc">Title: A to Z</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => {
                handleSearch(true);
                updateQueryParams();
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="info" sx={{ my: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          {filteredBooks.length > 0 ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Showing {filteredBooks.length} of {totalResults} results
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 4 }} />
              
              <Grid container spacing={3}>
                {filteredBooks.map((book) => (
                  <Grid item xs={12} sm={6} md={3} key={book.id}>
                    <BookCard 
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      imageUrl={book.imageUrl}
                      price={book.price}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={searchParams.page} 
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ my: 8, textAlign: 'center' }}>
              <Typography variant="h6">No books found matching your criteria.</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Try adjusting your search terms or filters.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;