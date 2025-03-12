interface BookResponse {
  books: Book[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  isbn: string;
  publicationYear?: number;
  publisher?: string;
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Get all books with pagination
export const getAllBooks = async (page = 0, size = 10): Promise<BookResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books?page=${page}&size=${size}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching books: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    return { books: [], currentPage: 0, totalItems: 0, totalPages: 0 };
  }
};

// Search books
export const searchBooks = async (query: string, page = 0, size = 10): Promise<BookResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/books/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    
    if (!response.ok) {
      throw new Error(`Error searching books: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching books:', error);
    return { books: [], currentPage: 0, totalItems: 0, totalPages: 0 };
  }
};

// Get books by category
export const getBooksByCategory = async (category: string, page = 0, size = 10): Promise<BookResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/books/category/${encodeURIComponent(category)}?page=${page}&size=${size}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching books by category: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching books by category:', error);
    return { books: [], currentPage: 0, totalItems: 0, totalPages: 0 };
  }
};

// Get book by ID
export const getBookById = async (id: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching book details: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};