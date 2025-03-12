export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description: string;
  imageUrl: string;
  price: number;
  publisher?: string;
  language?: string;
  pageCount?: number;
  category: string;
  publicationYear?: number;
  stockQuantity?: number;
  averageRating?: number;
  ratingsCount?: number;
  ageGroup?: string;
  openLibraryKey?: string | null; // Added for Open Library integration
}

// Helper function to format book data if needed
export const formatBookData = (book: any): Book => {
  return {
    id: book.id || 0,
    title: book.title || 'Unknown Title',
    author: book.author || 'Unknown Author',
    isbn: book.isbn || 'N/A',
    description: book.description || 'No description available',
    imageUrl: book.imageUrl || '',
    price: typeof book.price === 'number' ? book.price : parseFloat(book.price) || 9.99,
    publisher: book.publisher,
    language: book.language,
    pageCount: book.pageCount,
    category: book.category || 'Uncategorized',
    publicationYear: book.publicationYear,
    stockQuantity: book.stockQuantity,
    averageRating: book.averageRating,
    ratingsCount: book.ratingsCount,
    ageGroup: book.ageGroup,
    openLibraryKey: book.openLibraryKey
  };
};

// Helper function to format publication year to a date string for display
export const formatPublicationDate = (year?: number): string => {
  if (!year) return 'Unknown';
  return year.toString();
};

// Function to convert Google Books data to our Book format (for backward compatibility)
export const convertGoogleBookToBook = (googleBook: any): Book => {
  const volumeInfo = googleBook.volumeInfo || {};
  const saleInfo = googleBook.saleInfo || {};
  
  return {
    id: parseInt(googleBook.id, 10) || 0,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || 'N/A',
    description: volumeInfo.description || 'No description available',
    imageUrl: volumeInfo.imageLinks?.thumbnail || '',
    price: saleInfo.listPrice?.amount || 9.99,
    publisher: volumeInfo.publisher,
    language: volumeInfo.language,
    pageCount: volumeInfo.pageCount,
    category: volumeInfo.categories?.[0] || 'Uncategorized',
    publicationYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4), 10) : undefined,
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount
  };
};