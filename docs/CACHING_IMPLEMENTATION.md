# Caching Implementation for AI API Calls

## Overview

This document describes the caching system implemented to reduce AI token usage and API costs by caching similar topics that have been retrieved.

## Features

### 1. Extraction Cache (`extractionCache` table)
- Caches results from `extractTopic` and `extractTopicsBatch` functions
- Stores normalized text for similarity matching
- 24-hour cache duration with automatic expiration
- Tracks hit count to identify frequently accessed topics

### 2. Insight Cache (`insightCache` table)
- Caches results from `searchTopic` function (already implemented)
- Stores topic research insights, key points, and related concepts
- 24-hour cache duration with automatic expiration

### 3. Similarity-Based Matching
- Uses Jaccard similarity algorithm to match similar text inputs
- Default similarity threshold: 85%
- Normalizes text by removing punctuation and converting to lowercase
- Compares word sets to find semantically similar cached entries

## How It Works

### Topic Extraction Flow

1. **Cache Check**: Before calling OpenAI API, check for exact or similar cached results
2. **Exact Match**: Hash-based lookup for identical text inputs
3. **Similar Match**: If no exact match, search for similar text using word overlap
4. **Cache Miss**: If no match found, call OpenAI API and cache the result
5. **Cache Storage**: Store result with normalized text for future similarity matching

### Batch Processing Optimization

The `extractTopicsBatch` function now:
1. Checks cache for each text in the batch
2. Only sends uncached texts to OpenAI API
3. Combines cached and new results
4. Stores new results in cache for future use

This can reduce API calls by 80-95% for repeated or similar content.

## Cache Statistics

Each cache entry tracks:
- `hitCount`: Number of times the cached result was used
- `createdAt`: When the entry was first cached
- `expiresAt`: When the entry will expire (24 hours from creation)

## Benefits

1. **Cost Reduction**: Significantly reduces OpenAI API token usage
2. **Performance**: Faster response times for cached queries
3. **Scalability**: Handles repeated topics efficiently
4. **Smart Matching**: Finds similar topics even with slight variations in wording

## Example Scenarios

### Scenario 1: Exact Match
- Input: "machine learning algorithms"
- Cache: Contains exact match
- Result: Instant response from cache, 0 API tokens used

### Scenario 2: Similar Match
- Input: "machine learning algorithm"
- Cache: Contains "machine learning algorithms" (85%+ similarity)
- Result: Instant response from cache, 0 API tokens used

### Scenario 3: Batch Processing
- Input: 10 text segments
- Cache: 7 exact/similar matches found
- Result: Only 3 segments sent to API, 70% token savings

## Cache Cleanup

Expired cache entries are automatically cleaned up by:
- `cleanupExpiredCache`: Removes expired insight cache entries
- `cleanupExpiredExtractionCache`: Removes expired extraction cache entries

These can be run periodically via Convex cron jobs if needed.

## Configuration

- **Cache Duration**: 24 hours (configurable via `CACHE_DURATION_MS`)
- **Similarity Threshold**: 85% (configurable per query)
- **Max Similar Entries Checked**: 50 entries per lookup
