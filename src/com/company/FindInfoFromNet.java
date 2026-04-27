package com.company;

import com.company.metadata.MovieMetadataProviders;

/**
 * Backwards-compatible facade for {@link com.company.metadata.MovieMetadataProviders}.
 */
public class FindInfoFromNet {

    public static Movie searchResults(Movie movie) {
        return MovieMetadataProviders.enrich(movie);
    }

    /**
     * Fetches a mirror / base site URL; only needed for the 30nama HTML flow.
     */
    public static void siteChange() {
        com.company.metadata.ThirtyNamaMovieMetadataProvider.refreshBaseUrl();
    }
}
