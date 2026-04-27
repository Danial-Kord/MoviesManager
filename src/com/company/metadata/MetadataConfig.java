package com.company.metadata;

import com.company.Information;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads {@code user.home/.moviemanager/metadata.properties} (optional).
 * <p>
 * Keys:
 * <ul>
 *   <li>{@code metadata.provider} — {@code tmdb} or {@code thirty_nama} (default: thirty_nama)</li>
 *   <li>{@code tmdb.apiKey} — API key from https://www.themoviedb.org/settings/api</li>
 * </ul>
 * </p>
 */
public final class MetadataConfig {
    public static final String PROVIDER_TMDB = "tmdb";
    public static final String PROVIDER_THIRTY_NAMA = "thirty_nama";

    private static final String DIR = ".moviemanager";
    private static final String FILE = "metadata.properties";

    private static volatile MetadataConfig instance;

    private final String provider;
    private final String tmdbApiKey;

    private MetadataConfig(String provider, String tmdbApiKey) {
        this.provider = provider;
        this.tmdbApiKey = tmdbApiKey;
    }

    public static MetadataConfig getInstance() {
        if (instance == null) {
            synchronized (MetadataConfig.class) {
                if (instance == null) {
                    instance = load();
                }
            }
        }
        return instance;
    }

    static void resetForTests() {
        instance = null;
    }

    private static MetadataConfig load() {
        String provider = PROVIDER_THIRTY_NAMA;
        String tmdbKey = "";
        File configFile = new File(Information.path, DIR + File.separator + FILE);
        if (configFile.isFile()) {
            Properties p = new Properties();
            try (InputStream in = new FileInputStream(configFile)) {
                p.load(in);
            } catch (IOException ignored) {
                // defaults below
            }
            provider = p.getProperty("metadata.provider", provider).trim();
            tmdbKey = p.getProperty("tmdb.apiKey", "").trim();
        }
        return new MetadataConfig(provider, tmdbKey);
    }

    public String getProvider() {
        return provider;
    }

    public String getTmdbApiKey() {
        return tmdbApiKey;
    }

    public boolean useTmdb() {
        return PROVIDER_TMDB.equalsIgnoreCase(provider) && tmdbApiKey != null && !tmdbApiKey.isEmpty();
    }
}
