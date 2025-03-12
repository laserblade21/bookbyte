export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    pageCount?: number;
    language?: string;
    publisher?: string;
    subtitle?: string;
  };
  saleInfo?: {
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    isEbook?: boolean;
    saleability?: string;
  };
  accessInfo?: {
    webReaderLink?: string;
    epub?: {
      isAvailable: boolean;
    };
    pdf?: {
      isAvailable: boolean;
    };
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems: number;
  kind?: string;
  error?: {
    message: string;
    errors: any[];
  };
}

// Simple cache implementation
interface CacheItem {
  data: any;
  timestamp: number;
}

class ApiCache {
  private cache: Record<string, CacheItem> = {};
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  constructor() {
    // Try to load cache from localStorage
    try {
      const savedCache = localStorage.getItem('bookByteApiCache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
      }
    } catch (e) {
      console.error('Error loading cache:', e);
      this.cache = {};
    }
  }

  get(key: string): any | null {
    const item = this.cache[key];
    if (!item) return null;
    
    // Check if the item is expired
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      delete this.cache[key];
      this.saveCache();
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
    this.saveCache();
  }

  private saveCache(): void {
    try {
      localStorage.setItem('bookByteApiCache', JSON.stringify(this.cache));
    } catch (e) {
      console.error('Error saving cache:', e);
    }
  }
}

// Rate limiter to prevent too many requests
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly DELAY = 500; // minimum ms between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } catch (e) {
        console.error('Error processing queued task:', e);
      }
      
      // Wait before processing the next task
      setTimeout(() => {
        this.processQueue();
      }, this.DELAY);
    }
  }
}

// Initialize cache and rate limiter
const apiCache = new ApiCache();
const rateLimiter = new RateLimiter();

// Get a random book cover image URL
const getRandomCoverImage = (title: string, index: number) => {
  // Instead of using placeholder.com which might be unreliable,
  // generate a colored background with text (this is handled in the BookCard now)
  return '';
};

// Mock data for testing or when API fails
const mockBestsellerBooks: GoogleBooksResponse = {
  items: Array(8).fill(null).map((_, index) => ({
    id: `mock-bestseller-${index}`,
    volumeInfo: {
      title: `Bestseller Book ${index + 1}`,
      authors: ['Popular Author'],
      publishedDate: '2023',
      description: 'A bestselling book that everyone is reading right now.',
      categories: ['Fiction', 'Bestseller'],
      imageLinks: {
        thumbnail: getRandomCoverImage('Bestseller', index)
      }
    },
    saleInfo: {
      listPrice: {
        amount: 14.99 + index,
        currencyCode: 'USD'
      }
    }
  })),
  totalItems: 8
};

const mockCategoryBooks = (category: string): GoogleBooksResponse => ({
  items: Array(8).fill(null).map((_, index) => ({
    id: `mock-${category.toLowerCase()}-${index}`,
    volumeInfo: {
      title: `${category} Book ${index + 1}`,
      authors: [`${category} Author`],
      publishedDate: '2023',
      description: `A great book about ${category.toLowerCase()}.`,
      categories: [category],
      imageLinks: {
        thumbnail: getRandomCoverImage(category, index)
      }
    },
    saleInfo: {
      listPrice: {
        amount: 9.99 + index,
        currencyCode: 'USD'
      }
    }
  })),
  totalItems: 8
});

// Mock data for a single book
const getMockBookById = (id: string): GoogleBookItem => {
  const categoryMatch = id.match(/mock-(.*?)-\d+/);
  const category = categoryMatch ? categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1) : 'Fiction';
  
  const indexMatch = id.match(/mock-.*?-(\d+)/);
  const index = indexMatch ? parseInt(indexMatch[1]) : 0;
  
  return {
    id,
    volumeInfo: {
      title: `${category} Book ${index + 1}`,
      authors: [`${category} Author`],
      publishedDate: '2023',
      description: `A detailed description of this ${category.toLowerCase()} book. This is a mock description for demonstration purposes. It contains information about the plot, characters, and themes of the book.
      
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce auctor, nisl eget ultricies ultrices, nunc nisl aliquam nunc, eget aliquet nisl nisl eget nisl. Fusce auctor, nisl eget ultricies ultrices, nunc nisl aliquam nunc, eget aliquet nisl nisl eget nisl.
      
      This book explores the fascinating world of ${category.toLowerCase()} through engaging narratives and compelling characters.`,
      categories: [category],
      imageLinks: {
        thumbnail: getRandomCoverImage(category, index)
      },
      pageCount: 250 + index * 10,
      language: 'en',
      publisher: 'Book Byte Publishing',
      subtitle: 'An Exciting Journey'
    },
    saleInfo: {
      listPrice: {
        amount: 9.99 + index,
        currencyCode: 'USD'
      },
      isEbook: Math.random() > 0.5
    },
    accessInfo: {
      webReaderLink: '#preview',
      epub: {
        isAvailable: Math.random() > 0.5
      },
      pdf: {
        isAvailable: Math.random() > 0.5
      }
    }
  };
};

/**
 * Search books by query with Google Books API
 * @param query Search query string
 * @param maxResults Maximum number of results to return
 * @param startIndex Start index for pagination
 * @returns Promise with Google Books API response
 */
export async function searchBooks(query: string, maxResults = 10, startIndex = 0): Promise<GoogleBooksResponse> {
  if (!query) {
    console.error("No query provided to searchBooks function");
    return { items: [], totalItems: 0 };
  }
  
  console.log(`Searching for: "${query}"`);
  
  // Create a cache key
  const cacheKey = `search_${query}_${maxResults}_${startIndex}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for: "${query}"`);
    return cachedData;
  }
  
  // Use rate limiter for API calls
  return rateLimiter.add(async () => {
    try {
      // Build URL - no API key required for basic volume queries
      const baseUrl = "https://www.googleapis.com/books/v1/volumes";
      const url = `${baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data: GoogleBooksResponse = await response.json();
      
      // Cache the successful response
      apiCache.set(cacheKey, data);
      
      // Check if we have results
      if (!data.items || data.items.length === 0) {
        console.warn("No books found for query:", query);
        
        // For testing - return mock data for certain common categories
        if (query.includes('subject:bestseller')) {
          console.log('Returning mock bestseller data');
          return mockBestsellerBooks;
        }
        
        if (query.includes('subject:fiction')) {
          console.log('Returning mock fiction data');
          return mockCategoryBooks('Fiction');
        }
        
        if (query.includes('subject:science')) {
          console.log('Returning mock science data');
          return mockCategoryBooks('Science');
        }
        
        if (query.includes('subject:kids')) {
          console.log('Returning mock kids data');
          return mockCategoryBooks('Kids');
        }
        
        if (query.includes('subject:art')) {
          console.log('Returning mock art data');
          return mockCategoryBooks('Art');
        }
        
        // For any other category
        if (query.includes('subject:')) {
          const category = query.split('subject:')[1].trim();
          console.log(`Returning mock ${category} data`);
          return mockCategoryBooks(category.charAt(0).toUpperCase() + category.slice(1));
        }
      }
      
      console.log(`Found ${data.items?.length || 0} books for query: "${query}"`);
      return data;
    } catch (error) {
      console.error("Error fetching from Google Books API:", error);
      
      // For testing - return mock data for common categories even on error
      if (query.includes('subject:bestseller')) {
        console.log('API error - returning mock bestseller data');
        return mockBestsellerBooks;
      }
      
      if (query.includes('subject:fiction')) {
        console.log('API error - returning mock fiction data');
        return mockCategoryBooks('Fiction');
      }
      
      if (query.includes('subject:science')) {
        console.log('API error - returning mock science data');
        return mockCategoryBooks('Science');
      }
      
      if (query.includes('subject:kids')) {
        console.log('API error - returning mock kids data');
        return mockCategoryBooks('Kids');
      }
      
      if (query.includes('subject:')) {
        const category = query.split('subject:')[1].trim();
        console.log(`API error - returning mock ${category} data`);
        return mockCategoryBooks(category.charAt(0).toUpperCase() + category.slice(1));
      }
      
      // If all else fails, return empty results
      return { items: [], totalItems: 0 };
    }
  });
}

/**
 * Get books by category
 * @param category Category to search for
 * @param maxResults Maximum number of results to return
 * @returns Promise with Google Books API response
 */
export async function getBooksByCategory(category: string, maxResults = 10): Promise<GoogleBooksResponse> {
  console.log(`Getting books for category: ${category}`);
  // For categories, we just use the category as the search term
  return searchBooks(`subject:${category.toLowerCase()}`, maxResults);
}

/**
 * Get a single book by its ID
 * @param id Book ID
 * @returns Promise with the book data
 */
export async function getBookById(id: string): Promise<GoogleBookItem | null> {
  console.log(`Getting book with ID: ${id}`);
  
  // Create a cache key
  const cacheKey = `book_${id}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for book ID: ${id}`);
    return cachedData;
  }
  
  // Handle mock IDs for testing
  if (id.startsWith('mock-')) {
    console.log('Returning mock book data for ID:', id);
    return getMockBookById(id);
  }
  
  // Use rate limiter for API calls
  return rateLimiter.add(async () => {
    try {
      // Build URL for volume lookup
      const baseUrl = "https://www.googleapis.com/books/v1/volumes";
      const url = `${baseUrl}/${id}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data: GoogleBookItem = await response.json();
      
      // Cache the successful response
      apiCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error("Error fetching book details:", error);
      
      // For demo purposes, return a mock book if API fails
      return {
        id,
        volumeInfo: {
          title: "Book Not Found",
          authors: ["Unknown Author"],
          publishedDate: "Unknown",
          description: "Sorry, we couldn't retrieve the details for this book. Please try again later.",
          categories: ["Uncategorized"],
          pageCount: 0,
          language: "en",
          publisher: "Unknown"
        },
        saleInfo: {
          listPrice: {
            amount: 0,
            currencyCode: "USD"
          },
          isEbook: false
        }
      };
    }
  });
}