package com.bytebooks.controller;

import com.bytebooks.model.Book;
import com.bytebooks.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository bookRepository;

    @Autowired
    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        Page<Book> books = bookRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("books", books.getContent());
        response.put("currentPage", books.getNumber());
        response.put("totalItems", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookRepository.searchBooks(query, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("books", books.getContent());
        response.put("currentPage", books.getNumber());
        response.put("totalItems", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getBooksByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookRepository.findByCategoryContainingIgnoreCase(category, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("books", books.getContent());
        response.put("currentPage", books.getNumber());
        response.put("totalItems", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());

        return ResponseEntity.ok(response);
    }
}