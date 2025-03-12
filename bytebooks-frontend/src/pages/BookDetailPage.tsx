import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookById } from '../services/apiService';
import {
  Box,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<any>(null); 
  const [imageError, setImageError] = useState(false); 
  const [error, setError] = useState<string>(''); // Error state
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }

      try {
        const bookId = !isNaN(parseInt(id)) ? parseInt(id) : id;

        const bookData = await getBookById(bookId);
        setBook(bookData);
        setLoading(false);
      } catch (err) {
        setError('An error occurred while fetching the book details');
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Handle sharing
  const handleShare = () => {
    if (navigator.share && book) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author}`,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {book.title}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={imageError ? undefined : book.imageUrl}
              alt={book.title}
              sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              onError={() => setImageError(true)}
            />
            {imageError && (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" fontWeight="bold">{book.title}</Typography>
                <Typography variant="body2">by {book.author}</Typography>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Author: {book.author}
          </Typography>
          <Typography variant="body1" paragraph>
            {book.description}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleShare}>
            Share this Book
          </Button>
          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MenuBook fontSize="small" sx={{ mr: 1 }} />
                      Page Count
                    </Box>
                  </TableCell>
                  <TableCell>{book.pageCount || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MenuBook fontSize="small" sx={{ mr: 1 }} />
                      Published Date
                    </Box>
                  </TableCell>
                  <TableCell>{book.publishedDate || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MenuBook fontSize="small" sx={{ mr: 1 }} />
                      Language
                    </Box>
                  </TableCell>
                  <TableCell>{book.language || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MenuBook fontSize="small" sx={{ mr: 1 }} />
                      ISBN
                    </Box>
                  </TableCell>
                  <TableCell>{book.isbn || 'Unknown'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookDetailPage;
