package com.nexuslink.urlshortener.service;

import com.nexuslink.urlshortener.model.Url;
import com.nexuslink.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class UrlService {

    @Autowired
    private UrlRepository urlRepository;

    public String shortenUrl(String originalUrl) {
        // Generate a 6-character random string
        String shortCode = UUID.randomUUID().toString().substring(0, 6);
        
        // Ensure uniqueness (basic check)
        while (urlRepository.findByShortCode(shortCode).isPresent()) {
            shortCode = UUID.randomUUID().toString().substring(0, 6);
        }

        Url url = new Url(originalUrl, shortCode);
        urlRepository.save(url);
        return shortCode;
    }

    public Optional<String> getOriginalUrl(String shortCode) {
        return urlRepository.findByShortCode(shortCode)
                .map(Url::getOriginalUrl);
    }
}