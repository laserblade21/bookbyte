package com.bytebooks.repository;

import com.bytebooks.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Find books by title containing the search term
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Find books by author
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);
    
    // Find books by category
    Page<Book> findByCategoryContainingIgnoreCase(String category, Pageable pageable);
    
    // Combined search across multiple fields
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> searchBooks(@Param("searchTerm") String searchTerm, Pageable pageable);
}