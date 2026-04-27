package com.company.metadata;

import com.company.Movie;

/**
 * Lazy singleton {@link MovieMetadataProvider} from {@link MetadataConfig}.
 * <p>Uses TMDb when {@code user.home/.moviemanager/metadata.properties} sets
 * {@code metadata.provider=tmdb} and a non-empty {@code tmdb.apiKey}; otherwise 30nama HTML scraping.
 */
public final class MovieMetadataProviders {
    private static volatile MovieMetadataProvider instance;

    private MovieMetadataProviders() {
    }

    public static MovieMetadataProvider get() {
        if (instance == null) {
            synchronized (MovieMetadataProviders.class) {
                if (instance == null) {
                    instance = create();
                }
            }
        }
        return instance;
    }

    private static MovieMetadataProvider create() {
        MetadataConfig c = MetadataConfig.getInstance();
        if (c.useTmdb()) {
            return new TmdbMovieMetadataProvider(c.getTmdbApiKey());
        }
        return new ThirtyNamaMovieMetadataProvider();
    }

    /**
     * Call before processing a batch of movies when the 30nama provider is active
     * (resolves a working base URL for filtered regions).
     */
    public static void beforeEnrichmentBatch() {
        if (!MetadataConfig.getInstance().useTmdb()) {
            ThirtyNamaMovieMetadataProvider.refreshBaseUrl();
        }
    }

    /**
     * For UI entry points; same as {@link #get()}{@code .enrich(movie)}.
     */
    public static Movie enrich(Movie movie) {
        return get().enrich(movie);
    }
}
