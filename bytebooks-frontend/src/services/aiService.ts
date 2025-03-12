import { Book } from '../utils/bookUtils';
const DEEPSEEK_API_URL = process.env.REACT_APP_DEEPSEEK_API_URL;
const DEEPSEEK_API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY;
// Interface for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessageToAI = async (
  message: string, 
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    // Check if API key is available
    if (!DEEPSEEK_API_KEY) {
      console.warn('DeepSeek API key is not set. Using mock responses.');
      return getMockResponse(message);
    }

    console.log('Sending message to DeepSeek API:', message);
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', 
        messages: [
          {
            role: 'system',
            content: 'You are ByteBooks AI, a helpful assistant for ByteBooks online bookstore. You help users discover books, learn about authors and genres, and get personalized recommendations. You are knowledgeable about literature, publishing, and reading in general. Keep your answers helpful, concise, and focused on books and reading.'
          },
          ...chatHistory,
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return getMockResponse(message);
  }
};

// Function to generate book recommendations
export const getAIBookRecommendations = async (
  userPreferences: string,
  availableBooks: Book[]
): Promise<Book[]> => {
  try {
    if (!DEEPSEEK_API_KEY || availableBooks.length === 0) {
      return getMockBookRecommendations(userPreferences, availableBooks);
    }

    // Create a list of book titles and authors to send to the AI
    const booksList = availableBooks.slice(0, 50).map(book => 
      `${book.title} by ${book.author} (${book.category})`
    ).join('\n');

    const prompt = `Based on the user's preferences: "${userPreferences}", recommend 5 books from this list:\n\n${booksList}\n\nReturn just the book titles separated by commas, nothing else.`;
    
    const response = await sendMessageToAI(prompt);

    // Parse the response to get recommended book titles
    const recommendedTitles = response.split(',').map(title => title.trim());
    
    // Find the corresponding books from our available books
    const recommendedBooks = availableBooks.filter(book => 
      recommendedTitles.some(title => 
        book.title.toLowerCase().includes(title.toLowerCase())
      )
    );

    return recommendedBooks.slice(0, 5); // Ensure we return at most 5 books
  } catch (error) {
    console.error('Error getting AI book recommendations:', error);
    return getMockBookRecommendations(userPreferences, availableBooks);
  }
};

// Function to generate book insights
export const getBookInsights = async (book: Book): Promise<any> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return getMockBookInsights(book);
    }

    const prompt = `
    Analyze this book and provide insights:
    Title: ${book.title}
    Author: ${book.author}
    Description: ${book.description}
    
    Provide the following in JSON format:
    1. Main themes (list of 3-5)
    2. Writing style (brief description)
    3. Who would enjoy this book (brief description)
    4. Similar books (list of 3 titles and authors)
    `;
    
    const response = await sendMessageToAI(prompt);
    
    try {
      // Try to parse as JSON, but have fallback if it's not valid JSON
      return JSON.parse(response);
    } catch (e) {
      // If not valid JSON, return the text response
      return {
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('Error getting book insights:', error);
    return getMockBookInsights(book);
  }
};

// Function to answer book-related questions
export const answerBookQuestion = async (
  question: string,
  book: Book
): Promise<string> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return getMockBookAnswer(question, book);
    }

    const prompt = `
    Book: ${book.title} by ${book.author}
    Category: ${book.category}
    Description: ${book.description}
    
    User question: "${question}"
    
    Please answer the question about this book. If you don't know the specific answer because it's not in the provided information, give your best educated response based on your knowledge of literature and this type of book, but indicate that it's your best guess based on limited information.
    `;
    
    return await sendMessageToAI(prompt);
  } catch (error) {
    console.error('Error answering book question:', error);
    return getMockBookAnswer(question, book);
  }
};

// Mock response functions for fallbacks
const getMockResponse = (message: string): string => {
  if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggestion')) {
    return "Based on your interests, I'd recommend 'The Midnight Library' by Matt Haig, 'Project Hail Mary' by Andy Weir, or 'Klara and the Sun' by Kazuo Ishiguro. These are popular titles with great reviews!";
  }
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! I'm the ByteBooks AI assistant. How can I help you discover your next great read today?";
  }
  
  if (message.toLowerCase().includes('science fiction') || message.toLowerCase().includes('sci-fi')) {
    return "For science fiction fans, I recommend checking out works by Ted Chiang, Liu Cixin, and Martha Wells. The 'Murderbot Diaries' series is particularly popular right now!";
  }
  
  if (message.toLowerCase().includes('mystery') || message.toLowerCase().includes('thriller')) {
    return "If you enjoy mysteries and thrillers, you might like books by Tana French, Jane Harper, or Anthony Horowitz. 'The Thursday Murder Club' by Richard Osman is also a delightful recent addition to the genre.";
  }
  
  return "I'm here to help you find your next favorite book. You can ask me for recommendations based on genre, author, or themes you enjoy reading about.";
};

const getMockBookRecommendations = (
  userPreferences: string,
  availableBooks: Book[]
): Book[] => {
  console.log('Getting mock recommendations based on:', userPreferences);
  
  // Return a random selection of 5 books as recommendations
  const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

const getMockBookInsights = (book: Book): any => {
  return {
    themes: [
      'Personal Growth', 
      'Adventure', 
      book.category || 'Literature',
      book.category === 'fiction' ? 'Character Development' : 'Knowledge'
    ],
    writingStyle: `${book.author} employs a ${book.category === 'fiction' ? 'narrative' : 'informative'} style that engages readers through ${book.category === 'fiction' ? 'vivid descriptions and dialogue' : 'clear explanations and examples'}.`,
    audience: `This book would appeal to readers interested in ${book.category}, particularly those who enjoy ${book.author}'s unique perspective on the subject.`,
    similarBooks: [
      { title: `Another ${book.category} Book`, author: 'Similar Author 1' },
      { title: `The ${book.category} Experience`, author: 'Similar Author 2' },
      { title: `${book.category} Masterpiece`, author: 'Similar Author 3' }
    ]
  };
};

const getMockBookAnswer = (question: string, book: Book): string => {
  return `Based on what I know about "${book.title}" by ${book.author}, it's a notable work in the ${book.category} category. The book explores various themes and ideas that readers find engaging. To get more specific information, you might want to check reviews or read the full description.`;
};