# BookByte

BookByte is a modern React-based web application for discovering, searching, and exploring books. Built with TypeScript and Material UI, it offers a responsive and intuitive user interface for book enthusiasts.


## 🚀 Features

- **Interactive Homepage**: Featuring carousels for featured books, categorized sections, and personalized recommendations
- **Advanced Search**: Search by title, author, or keyword with filtering options for categories and price ranges
- **Category Browsing**: Explore books across nine different categories with an attractive UI
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **User Authentication**: Personalized content for authenticated users

## 📋 Tech Stack

- **Frontend**: React with TypeScript
- **Routing**: React Router
- **UI Components**: Material UI (@mui/material)
- **State Management**: React Context API
- **API Integration**: Open Books Library and DeepSeeks API

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bookbyte.git
   cd bookbyte
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your API keys
   ```
   REACT_APP_OPEN_BOOKS_API_KEY=your_open_books_api_key_here
   REACT_APP_DEEPSEEKS_API_KEY=your_deepseeks_api_key_here
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## 🏗️ Project Structure

```
bookbyte/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── books/
│   │   │   └── BookCard.tsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── SearchPage.tsx
│   ├── services/
│   │   └── googleBooksService.ts
│   ├── utils/
│   │   └── bookUtils.ts
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

## 📱 Pages and Components

### Home Page (`HomePage.tsx`)
The landing page featuring:
- Hero banner with call-to-action
- Featured books carousel
- Category browsing cards with icons
- Personalized recommendations (for authenticated users)
- Sections for Fiction, Science, and Kids' books

### Search Page (`SearchPage.tsx`)
Advanced search functionality with:
- Search by title, author, or keyword
- Category filtering
- Price range filtering
- Sorting options
- Pagination for search results

### BookCard Component
Reusable card component for displaying book information:
- Cover image
- Title and author
- Price

## 🔄 Data Flow

1. User interactions (search, filters) update the application state
2. Changes to search parameters are reflected in the URL
3. The app fetches data from the Google Books API based on current parameters
4. Results are converted to a consistent format using utility functions
5. Rendered components display the processed data

## 🔐 Authentication

The application uses a React Context (AuthContext) to manage authentication state:
- User login/logout
- Access to personalized content
- User preferences

## 📚 API Integration

The application integrates with two powerful APIs:

### Open Books Library
Used to fetch:
- Bestsellers
- Category-specific books
- Comprehensive book metadata

### DeepSeeks API
Used for:
- Enhanced search capabilities
- AI-powered book recommendations
- Natural language processing for improved search results

## 🎨 UI/UX Features

- **Category Color Coding**: Each category has a distinct color
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects on cards and buttons
- **Loading States**: Visual feedback during API calls

## 📈 Future Enhancements

- [ ] Book details page with expanded information
- [ ] User reviews and ratings
- [ ] Reading lists and favorites
- [ ] Dark mode support
- [ ] Advanced recommendation algorithm
- [ ] BACKEND DEVELOPMENT



This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Open Books Library](https://openbookslibrary.org)
