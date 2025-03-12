import { Book, formatBookData } from '../utils/bookUtils';

const generateMockBooks = (category: string, count: number): Book[] => {
  const books: Book[] = [];
  for (let i = 1; i <= count; i++) {
    books.push({
      id: i + (category.charCodeAt(0) * 100), // Create unique IDs based on category
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Book ${i}`,
      author: `Author ${i % 5 + 1}`,
      description: `This is a sample description for a ${category} book #${i}. It includes all the details a reader might want to know before purchasing this book, including plot summaries, themes, and more information about the author.`,
      category: category,
      imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(category)}+${i}`,
      price: Math.floor((9.99 + i % 10) * 100) / 100,
      isbn: `978123456${(i % 10).toString().padStart(4, '0')}`,
      publicationYear: 2020 + (i % 5),
      publisher: `${category.charAt(0).toUpperCase() + category.slice(1)} Publishing`,
      language: 'en',
      pageCount: 200 + (i * 10),
      stockQuantity: 10 + (i % 10),
      averageRating: Math.min(5, Math.floor((3.5 + (i % 5) / 10) * 10) / 10),
      ratingsCount: 10 + (i * 5)
    });
  }
  return books;
};

// Add different age groups for kids books
const addAgeGroupsToKidsBooks = (books: Book[]): Book[] => {
  const ageGroups = ['0-3', '4-7', '8-12', '13+'];
  return books.map((book, index) => ({
    ...book,
    ageGroup: ageGroups[index % ageGroups.length]
  }));
};

// Create mock data for different categories
const featuredBooks = generateMockBooks('bestseller', 12);
const fictionBooks = generateMockBooks('fiction', 20);
const scienceBooks = generateMockBooks('science', 15);
const kidsBooks = addAgeGroupsToKidsBooks(generateMockBooks('kids', 16));
const historyBooks = generateMockBooks('history', 14);
const cookingBooks = generateMockBooks('cooking', 10);
const technologyBooks = generateMockBooks('technology', 18);
const artBooks = generateMockBooks('art', 8);
const psychologyBooks = generateMockBooks('psychology', 12);

// Combine all books for searching
const allBooks = [
  ...featuredBooks, 
  ...fictionBooks, 
  ...scienceBooks, 
  ...kidsBooks,
  ...historyBooks,
  ...cookingBooks,
  ...technologyBooks,
  ...artBooks,
  ...psychologyBooks
];

// Interface to match expected response format
export interface SearchResponse {
  books: Book[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Mock API functions
export const getAllBooks = async (page = 0, size = 10): Promise<SearchResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    books: allBooks.slice(page * size, (page + 1) * size),
    currentPage: page,
    totalItems: allBooks.length,
    totalPages: Math.ceil(allBooks.length / size)
  };
};

export const getBookById = async (id: number): Promise<Book> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const book = allBooks.find(book => book.id === id);
  
  if (!book) {
    throw new Error('Book not found');
  }
  
  return book;
};

export const searchBooks = async (
  query: string,
  page = 0,
  size = 10
): Promise<SearchResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.trim() !== '');
  
  const filtered = allBooks.filter(book => {
    // If no search terms, return all books
    if (searchTerms.length === 0) return true;
    
    // Check if any search term matches title, author, or isbn
    return searchTerms.some(term => 
      book.title.toLowerCase().includes(term) || 
      book.author.toLowerCase().includes(term) ||
      (book.isbn && book.isbn.toLowerCase().includes(term)) ||
      (book.description && book.description.toLowerCase().includes(term))
    );
  });
  
  return {
    books: filtered.slice(page * size, (page + 1) * size),
    currentPage: page,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / size)
  };
};

export const getBooksByCategory = async (
  category: string,
  page = 0,
  size = 10
): Promise<{ items: Book[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let categoryBooks: Book[];
  
  // Map category parameter to our mock data categories
  switch (category.toLowerCase()) {
    case 'fiction':
      categoryBooks = fictionBooks;
      break;
    case 'science':
      categoryBooks = scienceBooks;
      break;
    case 'kids':
      categoryBooks = kidsBooks;
      break;
    case 'history':
      categoryBooks = historyBooks;
      break;
    case 'cooking':
      categoryBooks = cookingBooks;
      break;
    case 'technology':
      categoryBooks = technologyBooks;
      break;
    case 'art':
      categoryBooks = artBooks;
      break;
    case 'psychology':
      categoryBooks = psychologyBooks;
      break;
    case 'bestseller':
      categoryBooks = featuredBooks;
      break;
    default:
      // For unknown categories, create some mock data on the fly
      categoryBooks = generateMockBooks(category, 8);
  }
  
  return {
    items: categoryBooks.slice(page * size, (page + 1) * size)
  };
};