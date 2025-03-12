package com.bytebooks.service;

import com.bytebooks.model.Book;
import com.bytebooks.repository.BookRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@Service
public class CsvImportService {

    private static final Logger logger = LoggerFactory.getLogger(CsvImportService.class);
    private final BookRepository bookRepository;

    @Autowired
    public CsvImportService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional
    public void importBooksFromCsv(String csvFilePath) {
        logger.info("Starting import of books from CSV file: {}", csvFilePath);

        // Create a File object with the correct path
        File csvFile = new File(csvFilePath);
        logger.info("CSV file absolute path: {}", csvFile.getAbsolutePath());
        logger.info("CSV file exists: {}", csvFile.exists());

        try (CSVReader reader = new CSVReader(new FileReader(csvFile))) {
            // Read the header row to understand the column structure
            String[] header = reader.readNext();
            if (header == null) {
                logger.error("CSV file is empty or could not be read");
                return;
            }

            // Log the CSV structure to help with mapping
            logger.info("CSV Header: {}", String.join(", ", header));

            // Map column indices for easier access (adjust these based on your actual CSV structure)
            int titleIndex = findColumnIndex(header, "title");
            int authorIndex = findColumnIndex(header, "authors");
            int isbnIndex = findColumnIndex(header, "isbn");
            int yearIndex = findColumnIndex(header, "original_publication_year");
            int ratingIndex = findColumnIndex(header, "average_rating");
            int ratingCountIndex = findColumnIndex(header, "ratings_count");
            int imageUrlIndex = findColumnIndex(header, "image_url");
            int languageIndex = findColumnIndex(header, "language_code");

            // Start reading data rows
            String[] row;
            int count = 0;
            int batchSize = 100;

            while ((row = reader.readNext()) != null && count < 1000) { // Limit to 1000 for testing
                try {
                    Book book = createBookFromCsvRow(row, titleIndex, authorIndex, isbnIndex,
                            yearIndex, ratingIndex, ratingCountIndex, imageUrlIndex, languageIndex);

                    bookRepository.save(book);

                    count++;
                    if (count % batchSize == 0) {
                        logger.info("Imported {} books", count);
                    }
                } catch (Exception e) {
                    logger.error("Error processing row: {}", String.join(", ", row), e);
                }
            }

            logger.info("Import completed successfully. Total books imported: {}", count);

        } catch (IOException | CsvValidationException e) {
            logger.error("Error reading CSV file: {}", e.getMessage(), e);
        }
    }

    // Rest of your methods remain the same...
    private int findColumnIndex(String[] header, String columnName) {
        for (int i = 0; i < header.length; i++) {
            if (header[i].equalsIgnoreCase(columnName)) {
                return i;
            }
        }
        return -1; // Column not found
    }

    private Book createBookFromCsvRow(String[] row, int titleIndex, int authorIndex,
                                      int isbnIndex, int yearIndex, int ratingIndex,
                                      int ratingCountIndex, int imageUrlIndex, int languageIndex) {
        Book book = new Book();



        return book;
    }


}