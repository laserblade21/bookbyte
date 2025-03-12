import { Book } from '../utils/bookUtils';

export const OPEN_LIBRARY_API_URL = 'https://openlibrary.org';
export const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b';

// Convert Open Library book data to our Book model
export const convertOpenLibraryBookToBook = (openLibraryBook: any): Book => {
  try {
    // Debug the structure to understand what fields are available
    console.log('Converting book data:', JSON.stringify(openLibraryBook).substring(0, 200) + '...');
    
   
    const currentYear = new Date().getFullYear();
    const yearsSincePublication = currentYear - (openLibraryBook.first_publish_year || currentYear);
    const basePrice = 9.99;
    let calculatedPrice = basePrice;
    
    if (yearsSincePublication < 5) {
      calculatedPrice = basePrice + 10; // Newer books are more expensive
    } else if (yearsSincePublication < 20) {
      calculatedPrice = basePrice + 5;
    }
    
    // Round to two decimal places
    calculatedPrice = Math.round(calculatedPrice * 100) / 100;

    // Get the cover image URL if available
    let imageUrl = '';
    if (openLibraryBook.cover_i) {
      imageUrl = `${OPEN_LIBRARY_COVERS_URL}/id/${openLibraryBook.cover_i}-L.jpg`;
    } else if (openLibraryBook.cover_edition_key) {
      imageUrl = `${OPEN_LIBRARY_COVERS_URL}/olid/${openLibraryBook.cover_edition_key}-L.jpg`;
    } else if (openLibraryBook.isbn && openLibraryBook.isbn.length > 0) {
      // Try using ISBN for cover
      imageUrl = `${OPEN_LIBRARY_COVERS_URL}/isbn/${openLibraryBook.isbn[0]}-L.jpg`;
    } else if (openLibraryBook.key) {
      // Try using Open Library key
      imageUrl = `${OPEN_LIBRARY_COVERS_URL}/olid/${openLibraryBook.key.replace(/^\//, '')}-L.jpg`;
    }
    
    // Add debug logging
    console.log('Image URL generated:', imageUrl);

    // Extract the first author (if any)
    let author = 'Unknown Author';
    
    // Handle different author field formats from Open Library
    if (openLibraryBook.author_name && openLibraryBook.author_name.length > 0) {
      author = openLibraryBook.author_name[0];
    } else if (openLibraryBook.author && openLibraryBook.author.length > 0) {
      author = openLibraryBook.author[0];
    } else if (openLibraryBook.authors && openLibraryBook.authors.length > 0) {
      // Some endpoints return an authors array with name field
      author = openLibraryBook.authors[0].name || openLibraryBook.authors[0];
    } else if (openLibraryBook.by_statement) {
      // Sometimes there's a by_statement field with author info
      author = openLibraryBook.by_statement;
    }
    
    // Clean up author name if it's an object instead of a string
    if (typeof author === 'object' && author) {
      author = author;
    }
    
    // Extract categories/subjects
    let category = 'Uncategorized';
    if (openLibraryBook.subject && openLibraryBook.subject.length > 0) {
      category = openLibraryBook.subject[0];
    } else if (openLibraryBook.subject_facet && openLibraryBook.subject_facet.length > 0) {
      category = openLibraryBook.subject_facet[0];
    }
    
    // Generate a proper description (many OpenLibrary books don't have one)
    let description = 'No description available';
    if (openLibraryBook.description) {
      description = typeof openLibraryBook.description === 'string' 
        ? openLibraryBook.description 
        : openLibraryBook.description.value || 'No description available';
    } else if (openLibraryBook.first_sentence && openLibraryBook.first_sentence.length > 0) {
      description = `${openLibraryBook.first_sentence.join('. ')}...`;
    }
    
    // Get a valid work key for API calls if available
    let openLibraryKey = null;
    if (openLibraryBook.key) {
      openLibraryKey = openLibraryBook.key;
    } else if (openLibraryBook.edition_key && openLibraryBook.edition_key.length > 0) {
      openLibraryKey = `/books/${openLibraryBook.edition_key[0]}`;
    }
    
    // Create book object
    return {
      id: parseInt(openLibraryBook.cover_i || openLibraryBook._version_ || Date.now(), 10),
      title: openLibraryBook.title || 'Unknown Title',
      author,
      description,
      category,
      imageUrl,
      price: calculatedPrice,
      isbn: (openLibraryBook.isbn && openLibraryBook.isbn.length > 0) ? openLibraryBook.isbn[0] : 'N/A',
      publicationYear: openLibraryBook.first_publish_year,
      publisher: openLibraryBook.publisher && openLibraryBook.publisher.length > 0 ? openLibraryBook.publisher[0] : undefined,
      language: openLibraryBook.language && openLibraryBook.language.length > 0 ? openLibraryBook.language[0] : undefined,
      pageCount: openLibraryBook.number_of_pages_median || undefined,
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Random rating between 3 and 5
      ratingsCount: Math.floor(Math.random() * 500) + 10, // Random number of ratings
      openLibraryKey
    };
  } catch (error) {
    console.error('Error converting Open Library book:', error);
    // Return a default book as fallback
    return {
      id: 0,
      title: 'Error fetching book',
      author: 'Unknown Author',
      description: 'There was an error fetching this book.',
      category: 'Uncategorized',
      imageUrl: '',
      price: 9.99,
      isbn: 'N/A'
    };
  }
};

// Search books by query
export const searchBooks = async (query: string, page = 1, limit = 10): Promise<any> => {
  try {
    // Make sure to encode the query properly and handle spaces
    const cleanQuery = encodeURIComponent(query.trim());
    console.log(`Searching for: ${cleanQuery}`);
    
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/search.json?q=${cleanQuery}&page=${page}&limit=${limit}`
    );
    
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    console.log(`Found ${data.num_found} results for "${query}"`);
    return data;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

// Get books by category (subject)
export const getBooksByCategory = async (category: string, page = 1, limit = 10): Promise<any> => {
  try {
    const offset = (page - 1) * limit;
    // Use the subject search endpoint
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/subjects/${encodeURIComponent(category.toLowerCase())}.json?limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      console.log(`Subject search failed for "${category}", falling back to regular search`);
      // If subject search fails, try regular search with the category as a query
      return searchBooks(category, page, limit);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching books by category:', error);
    // Fall back to regular search
    return searchBooks(category, page, limit);
  }
};

// Get book by work ID (Open Library uses work IDs for books)
export const getBookByKey = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${OPEN_LIBRARY_API_URL}${key}.json`);
    if (!response.ok) throw new Error('Failed to fetch book details');
    
    const bookData = await response.json();
    
    // Get additional details from the edition endpoint if available
    if (bookData.editions?.key) {
      const editionResponse = await fetch(`${OPEN_LIBRARY_API_URL}${bookData.editions.key}.json`);
      if (editionResponse.ok) {
        const editionData = await editionResponse.json();
        return { ...bookData, edition: editionData };
      }
    }
    
    return bookData;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

// Get book by ID (for our App's ID, we need to search and find the book)
export const getBookById = async (id: string | number): Promise<any> => {
  try {
    // Since we don't have direct mapping between our IDs and Open Library,
    // We'll search for the book when they select one from a list
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // We'll usually store the book's Open Library key when listing books
    // But for now, let's search by ID against cover_i which we use for our ID
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/search.json?q=id:${numericId}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch book details');
    
    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    
    throw new Error('Book not found');
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

// Get trending books (for homepage)
export const getTrendingBooks = async (limit = 10): Promise<any> => {
  try {
    // Open Library doesn't have a direct "trending" endpoint,
    // so we'll search for books with recent activity
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/search.json?sort=new&limit=${limit}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch trending books');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending books:', error);
    throw error;
  }
};

// Get books for specific categories (for homepage sections)
export const getBooksByCategoryList = async (categories: string[], limit = 4): Promise<Record<string, any>> => {
  const results: Record<string, any> = {};
  
  await Promise.all(
    categories.map(async (category) => {
      try {
        const data = await getBooksByCategory(category, 1, limit);
        results[category] = data;
      } catch (error) {
        console.error(`Error fetching ${category} books:`, error);
        results[category] = { docs: [] };
      }
    })
  );
  
  return results;
};