package com.nexuslink.urlshortener.controller;

import com.nexuslink.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.Map;
import java.util.Optional;

@RestController
public class UrlController {

    @Autowired
    private UrlService urlService;

    @PostMapping("/api/shorten")
    public ResponseEntity<?> shortenUrl(@RequestBody Map<String, String> requestBody, HttpServletRequest request) {
        String originalUrl = requestBody.get("originalUrl");
        if (originalUrl == null || originalUrl.isEmpty()) {
            return ResponseEntity.badRequest().body("URL cannot be empty");
        }
        
        if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
            originalUrl = "https://" + originalUrl;
        }

        String shortCode = urlService.shortenUrl(originalUrl);

        // FIX: Dynamically construct the base URL
        String fullRequestUrl = request.getRequestURL().toString();
        String baseUrl = fullRequestUrl.replace("/api/shorten", "");
        
        // Render sits behind a proxy, so we ensure it forces HTTPS in production
        if (baseUrl.contains("onrender.com") && baseUrl.startsWith("http://")) {
            baseUrl = baseUrl.replace("http://", "https://");
        }

        String shortUrl = baseUrl + "/" + shortCode;

        return ResponseEntity.ok(Map.of(
            "shortCode", shortCode,
            "shortUrl", shortUrl
        ));
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        Optional<String> originalUrl = urlService.getOriginalUrl(shortCode);
        
        if (originalUrl.isPresent()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl.get()))
                    .build();
        }
        return ResponseEntity.notFound().build();
    }
}