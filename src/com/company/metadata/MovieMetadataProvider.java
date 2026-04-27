package com.company.metadata;

import com.company.Movie;

/**
 * Fills {@link Movie} fields from a remote source (web API or HTML scrape).
 */
public interface MovieMetadataProvider {
    /**
     * Enriches the given movie in place and returns the same instance.
     */
    Movie enrich(Movie movie);
}
