// src/types/Book.ts
export interface Book {
    id: string;
    googleBooksId: string;
    title: string;
    author: string;
    description: string;
    imageUrl: string;
    price: number;
    category: string;
    isbn: string;
    pageCount: number;
    language: string;
    publisher: string;
    publishedDate: string;
  }
  
  // src/types/User.ts
  export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  // src/types/Cart.ts
  export interface CartItem {
    id: number;
    bookId: string;
    title: string;
    author: string;
    imageUrl: string;
    price: number;
    quantity: number;
  }
  
  export interface Cart {
    items: CartItem[];
    total: number;
  }
  
  // src/types/ApiResponses.ts
  export interface ApiResponse<T> {
    data: T;
    status: string;
    message: string;
  }