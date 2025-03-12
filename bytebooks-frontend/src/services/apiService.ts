import { Book } from '../utils/bookUtils';
import * as openLibraryService from './openLibraryService';

// Temporary flag to use mock data while setting up Open Library API
const USE_MOCK_DATA = false;

// Import mock service for development
import * as mockService from './mockApiService';

// Interface to match expected response format
export interface SearchResponse {
  books: Book[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Get all books (featured/bestsellers)
export const getAllBooks = async (page = 0, size = 10): Promise<SearchResponse> => {
  if (USE_MOCK_DATA) {
    return mockService.getAllBooks(page, size);
  }
  
  try {
    const response = await openLibraryService.getTrendingBooks(size);
    
    const books = response.docs.map(openLibraryService.convertOpenLibraryBookToBook);
    const totalItems = response.num_found || 0;
    
    return {
      books,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / size)
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    // Fallback to mock data on error
    return mockService.getAllBooks(page, size);
  }
};

// Get book by ID
export const getBookById = async (id: string | number): Promise<Book> => {
  if (USE_MOCK_DATA) {
    return mockService.getBookById(typeof id === 'string' ? parseInt(id, 10) : id);
  }
  
  try {
    console.log(`Getting book details for ID: ${id}`);
    
    // If the ID is numeric, use the search endpoint
    if (typeof id === 'number' || !isNaN(parseInt(id.toString(), 10))) {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const searchResponse = await fetch(
        `${openLibraryService.OPEN_LIBRARY_API_URL}/search.json?q=id:${numericId}`
      );
      
      if (!searchResponse.ok) throw new Error('Failed to fetch book details');
      
      const searchData = await searchResponse.json();
      if (searchData.docs && searchData.docs.length > 0) {
        return openLibraryService.convertOpenLibraryBookToBook(searchData.docs[0]);
      }
      
      throw new Error('Book not found');
    }
    
    // Otherwise, try to get the book from Open Library using the key directly
    const key = id.toString();
    const response = await fetch(`${openLibraryService.OPEN_LIBRARY_API_URL}${key}.json`);
    
    if (!response.ok) throw new Error('Failed to fetch book details');
    
    const bookData = await response.json();
    return openLibraryService.convertOpenLibraryBookToBook({
      ...bookData,
      key: key
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    // Fallback to mock data on error
    if (typeof id === 'string' && isNaN(parseInt(id, 10))) {
      // If it's a string ID that's not numeric, it might be a key
      // Create a minimal book with the data we have
      return {
        id: 0,
        title: 'Book Details',
        author: 'Unknown Author',
        description: 'Unable to load complete book details.',
        category: 'Uncategorized',
        imageUrl: '',
        price: 9.99,
        isbn: 'N/A'
      };
    }
    
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return mockService.getBookById(numericId);
  }
};

// Search books by query
export const searchBooks = async (
  query: string,
  page = 0,
  size = 10
): Promise<SearchResponse> => {
  if (USE_MOCK_DATA) {
    return mockService.searchBooks(query, page, size);
  }
  
  try {
    // Make sure to encode the query properly and handle spaces
    const cleanQuery = encodeURIComponent(query.trim());
    console.log(`Searching for: ${cleanQuery}`);
    
    const response = await openLibraryService.searchBooks(query, page + 1, size);
    
    const books = response.docs.map(openLibraryService.convertOpenLibraryBookToBook);
    const totalItems = response.num_found || 0;
    console.log(`Found ${totalItems} results for "${query}"`);
    
    return {
      books,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / size)
    };
  } catch (error) {
    console.error('Error searching books:', error);
    // Fallback to mock data on error
    return mockService.searchBooks(query, page, size);
  }
};

// Get books by category
export const getBooksByCategory = async (
  category: string,
  page = 0,
  size = 10
): Promise<{ items: Book[] }> => {
  if (USE_MOCK_DATA) {
    return mockService.getBooksByCategory(category, page, size);
  }
  
  try {
    const response = await openLibraryService.getBooksByCategory(category, page + 1, size);
    
    let books: Book[] = [];
    
    // Handle response format from subject API vs search API
    if (response.works) {
      // Subject API format
      books = response.works.map(openLibraryService.convertOpenLibraryBookToBook);
    } else if (response.docs) {
      // Search API format
      books = response.docs.map(openLibraryService.convertOpenLibraryBookToBook);
    }
    
    return { items: books };
  } catch (error) {
    console.error('Error fetching books by category:', error);
    // Fallback to mock data on error
    return mockService.getBooksByCategory(category, page, size);
  }
};

// Get books for specific categories (for homepage)
export const getBooksByCategories = async (
  categories: string[]
): Promise<Record<string, Book[]>> => {
  if (USE_MOCK_DATA) {
    const result: Record<string, Book[]> = {};
    for (const category of categories) {
      const response = await mockService.getBooksByCategory(category, 0, 4);
      result[category] = response.items;
    }
    return result;
  }
  
  try {
    const responses = await openLibraryService.getBooksByCategoryList(categories);
    
    const result: Record<string, Book[]> = {};
    
    for (const category of Object.keys(responses)) {
      const response = responses[category];
      
      // Handle different response formats
      if (response.works) {
        // Subject API format
        result[category] = response.works.map(openLibraryService.convertOpenLibraryBookToBook);
      } else if (response.docs) {
        // Search API format
        result[category] = response.docs.map(openLibraryService.convertOpenLibraryBookToBook);
      } else {
        result[category] = [];
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching books by categories:', error);
    // Fallback to mock data
    const result: Record<string, Book[]> = {};
    for (const category of categories) {
      const response = await mockService.getBooksByCategory(category, 0, 4);
      result[category] = response.items;
    }
    return result;
  }
};