package com.bytebooks.config;

import com.bytebooks.service.CsvImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataImportRunner {

    private final CsvImportService csvImportService;

    @Value("${app.skip-data-import:false}")
    private boolean skipDataImport;

    // Change this to the file name or full path in the application.properties file
    @Value("${app.csv-import.file-path:goodreads_dataset.csv}")
    private String csvFilePath;

    @Autowired
    public DataImportRunner(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    @Bean
    public CommandLineRunner importData() {
        return args -> {
            // Print the CSV file path to make sure it's correct
            System.out.println("CSV File Path: " + csvFilePath);

            if (skipDataImport) {
                System.out.println("Data import skipped based on configuration");
                return;
            }

            System.out.println("Starting book data import from CSV at path: " + csvFilePath);
            csvImportService.importBooksFromCsv(csvFilePath); // Pass the file path
        };
    }
}
