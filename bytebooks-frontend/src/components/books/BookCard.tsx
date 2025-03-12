
import React, { useState } from 'react';
import { 
  Card, CardMedia, CardContent, Typography, Box, 
  IconButton, Button, Tooltip, useTheme
} from '@mui/material';
import { ShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  imageUrl?: string;
  price: number;
  discount?: number;
  openLibraryKey?: string | null;
}

const BookCard: React.FC<BookCardProps> = ({ 
  id, 
  title, 
  author, 
  imageUrl, 
  price, 
  discount = 0,
  openLibraryKey
}) => {
  const theme = useTheme();
  const { addItem, isItemInCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isInCart = isItemInCart(id);
  const discountedPrice = price * (1 - discount / 100);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    addItem({
      id,
      title,
      author,
      imageUrl,
      price: discountedPrice,
      quantity: 1
    });
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    setIsFavorite(!isFavorite);
    // In a real app, you would save this to user preferences
  };
  
  // Generate a placeholder background color from the book title
  const generatePlaceholderColor = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  // Determine the link path - use Open Library Key if available, otherwise use ID
  const linkPath = openLibraryKey ? `/book/${openLibraryKey}` : `/book/${id}`;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 3
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={linkPath}
        style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="div"
            sx={{
              height: 200,
              background: imageUrl ? 'white' : generatePlaceholderColor(title),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: imageUrl ? 0 : 2
            }}
          >
            {imageUrl ? (
              <Box 
                component="img"
                src={imageUrl}
                alt={title}
                sx={{ 
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  // If image fails to load, replace with title
                  e.currentTarget.style.display = 'none';
                  const container = e.currentTarget.parentElement;
                  if (container) {
                    container.style.padding = '16px';
                    container.style.textAlign = 'center';
                    container.style.backgroundColor = generatePlaceholderColor(title);
                    
                    const titleEl = document.createElement('div');
                    titleEl.textContent = title;
                    titleEl.style.fontWeight = 'bold';
                    titleEl.style.fontSize = '14px';
                    
                    const authorEl = document.createElement('div');
                    authorEl.textContent = `by ${author}`;
                    authorEl.style.marginTop = '8px';
                    authorEl.style.fontSize = '12px';
                    
                    container.appendChild(titleEl);
                    container.appendChild(authorEl);
                  }
                }}
              />
            ) : (
              <>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2">
                    by {author}
                  </Typography>
                </Box>
              </>
            )}
            
            {discount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  color: 'white',
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {discount}% OFF
              </Box>
            )}
            
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                opacity: isFavorite || isHovered ? 1 : 0.3,
                transition: 'opacity 0.2s'
              }}
            >
              <IconButton 
                size="small"
                onClick={handleToggleFavorite}
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' }
                }}
              >
                {isFavorite ? (
                  <Favorite fontSize="small" color="error" />
                ) : (
                  <FavoriteBorder fontSize="small" />
                )}
              </IconButton>
            </Box>
          </CardMedia>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 'medium',
            fontSize: '1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            height: '2.6em'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {author}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box>
            {discount > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    fontSize: '0.875rem',
                    mr: 1
                  }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${discountedPrice.toFixed(2)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>
          
          <Tooltip title={isInCart ? "Added to cart" : "Add to cart"}>
            <span>
              <Button
                size="small"
                color={isInCart ? "success" : "primary"}
                variant={isInCart ? "outlined" : "contained"}
                onClick={handleAddToCart}
                disabled={isInCart}
                sx={{ minWidth: 0, px: 1.5 }}
              >
                <ShoppingCart fontSize="small" />
              </Button>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Link>
  </Card>
);
};

export default BookCard;