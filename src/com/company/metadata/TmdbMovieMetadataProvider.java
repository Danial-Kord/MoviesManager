package com.company.metadata;

import com.company.Movie;
import com.company.UrlManager;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Uses The Movie Database (TMDb) JSON API: https://developer.themoviedb.org/docs
 * <p>Obtain a key at <a href="https://www.themoviedb.org/settings/api">TMDb account settings</a> and
 * set {@code tmdb.apiKey} in {@code user.home/.moviemanager/metadata.properties}.</p>
 */
public final class TmdbMovieMetadataProvider implements MovieMetadataProvider {
    private static final String BASE = "https://api.themoviedb.org/3";
    private static final String IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    private final String apiKey;

    public TmdbMovieMetadataProvider(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public Movie enrich(Movie movie) {
        if (apiKey == null || apiKey.isEmpty()) {
            return movie;
        }
        if (movie.getName() == null || movie.getName().isEmpty()) {
            return movie;
        }
        try {
            return enrichInternal(movie);
        } catch (IOException e) {
            e.printStackTrace();
            return movie;
        }
    }

    private Movie enrichInternal(Movie movie) throws IOException {
        String q = movie.getName().replace("mk", "").trim();
        String year = movie.getYear() == null ? "" : movie.getYear().trim();
        StringBuilder searchUrl = new StringBuilder(BASE);
        searchUrl.append("/search/movie?api_key=").append(URLEncoder.encode(apiKey, StandardCharsets.UTF_8.name()));
        searchUrl.append("&query=").append(URLEncoder.encode(q, StandardCharsets.UTF_8.name()));
        if (year.length() == 4) {
            try {
                int y = Integer.parseInt(year);
                searchUrl.append("&year=").append(y);
            } catch (NumberFormatException ignored) {
                // no year filter
            }
        }

        String searchJson;
        try {
            searchJson = UrlManager.getUrlJson(searchUrl.toString());
        } catch (IOException e) {
            return movie;
        }
        if (searchJson == null) {
            return movie;
        }
        int id = JsonExtract.firstIdInResults(searchJson);
        if (id < 0) {
            return movie;
        }

        String detailsPath = BASE + "/movie/" + id + "?api_key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8.name());
        String creditsPath = BASE + "/movie/" + id + "/credits?api_key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8.name());

        String details = UrlManager.getUrlJson(detailsPath);
        String credits = UrlManager.getUrlJson(creditsPath);
        if (details == null) {
            return movie;
        }

        String overview = JsonExtract.stringValue(details, "overview");
        if (overview != null) {
            movie.setSummery(overview);
        }
        String title = JsonExtract.stringValue(details, "title");
        if (title != null && !title.isEmpty()) {
            movie.setEnSummery(title);
        }
        String release = JsonExtract.stringValue(details, "release_date");
        if (release != null && release.length() >= 4) {
            movie.setYear(release.substring(0, 4));
        }
        String voteA = JsonExtract.numberOrString(details, "vote_average");
        if (voteA != null) {
            movie.setIMDBrating(voteA);
            movie.setIMDBscore(voteA);
        }
        String votes = JsonExtract.numberOrString(details, "vote_count");
        if (votes != null) {
            movie.setNumberOfVotes(votes);
        }
        String runtime = JsonExtract.numberOrString(details, "runtime");
        if (runtime != null) {
            movie.setDuration(runtime + " min");
        }
        String genres = joinGenreNames(details);
        if (genres != null) {
            movie.setGenre(genres);
        }
        if (credits != null) {
            String directors = extractCrewNames(credits, "Director");
            if (directors != null) {
                movie.setDirectors(directors);
            }
            String actors = extractTopCastNames(credits, 5);
            if (actors != null) {
                movie.setActors(actors);
            }
        }
        String poster = JsonExtract.stringValue(details, "poster_path");
        if (poster != null && !poster.isEmpty()) {
            if (!poster.startsWith("http")) {
                poster = IMAGE_BASE + poster;
            }
            PosterDownloader.savePosterFromUrl(poster, movie);
        }
        movie.setSorce("");
        movie.setSorce2("");
        movie.setUpdatetFromNet(true);
        movie.setUpdated2(true);
        return movie;
    }

    private static String joinGenreNames(String detailsJson) {
        int g = detailsJson.indexOf("\"genres\"");
        if (g < 0) {
            return null;
        }
        int start = detailsJson.indexOf('[', g);
        int end = detailsJson.indexOf(']', start);
        if (start < 0 || end < 0) {
            return null;
        }
        String block = detailsJson.substring(start, end);
        StringBuilder sb = new StringBuilder();
        int p = 0;
        while (p < block.length()) {
            int n = block.indexOf("\"name\":\"", p);
            if (n < 0) {
                break;
            }
            n += "\"name\":\"".length();
            int e = n;
            while (e < block.length() && block.charAt(e) != '"') {
                e++;
            }
            if (e > n) {
                if (sb.length() > 0) {
                    sb.append(", ");
                }
                sb.append(block, n, e);
            }
            p = e + 1;
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    private static String extractCrewNames(String creditsJson, String job) {
        int crewPos = creditsJson.indexOf("\"crew\"");
        if (crewPos < 0) {
            return null;
        }
        int arrStart = creditsJson.indexOf('[', crewPos);
        if (arrStart < 0) {
            return null;
        }
        int depth = 0;
        int arrEnd = -1;
        for (int i = arrStart; i < creditsJson.length(); i++) {
            char c = creditsJson.charAt(i);
            if (c == '[') {
                depth++;
            } else if (c == ']') {
                depth--;
                if (depth == 0) {
                    arrEnd = i;
                    break;
                }
            }
        }
        if (arrEnd < 0) {
            return null;
        }
        String crew = creditsJson.substring(arrStart, arrEnd + 1);
        String lookFor = "\"job\":\"" + job + "\"";
        String lookFor2 = "\"job\": \"" + job + "\"";
        StringBuilder out = new StringBuilder();
        int idx = 0;
        while (true) {
            int j1 = crew.indexOf(lookFor, idx);
            int j2 = crew.indexOf(lookFor2, idx);
            int j;
            if (j1 < 0) {
                j = j2;
            } else if (j2 < 0) {
                j = j1;
            } else {
                j = Math.min(j1, j2);
            }
            if (j < 0) {
                break;
            }
            int blockStart = crew.lastIndexOf('{', j);
            int blockEnd = crew.indexOf('}', j);
            if (blockStart >= 0 && blockEnd > blockStart) {
                String o = crew.substring(blockStart, blockEnd + 1);
                String name = JsonExtract.stringValue(o, "name");
                if (name != null) {
                    if (out.length() > 0) {
                        out.append(", ");
                    }
                    out.append(name);
                }
            }
            idx = j + 1;
        }
        return out.length() == 0 ? null : out.toString();
    }

    private static String extractTopCastNames(String creditsJson, int max) {
        int c = creditsJson.indexOf("\"cast\"");
        if (c < 0) {
            return null;
        }
        int arrStart = creditsJson.indexOf('[', c);
        if (arrStart < 0) {
            return null;
        }
        int depth = 0;
        int arrEnd = -1;
        for (int i = arrStart; i < creditsJson.length(); i++) {
            char ch = creditsJson.charAt(i);
            if (ch == '[') {
                depth++;
            } else if (ch == ']') {
                depth--;
                if (depth == 0) {
                    arrEnd = i;
                    break;
                }
            }
        }
        if (arrEnd < 0) {
            return null;
        }
        String cast = creditsJson.substring(arrStart, arrEnd + 1);
        StringBuilder out = new StringBuilder();
        int p = 0;
        int count = 0;
        while (count < max) {
            int n = cast.indexOf("\"name\":\"", p);
            if (n < 0) {
                break;
            }
            n += "\"name\":\"".length();
            int e = n;
            while (e < cast.length() && cast.charAt(e) != '"') {
                e++;
            }
            if (e > n) {
                if (out.length() > 0) {
                    out.append(", ");
                }
                out.append(cast, n, e);
                count++;
            }
            p = e + 1;
        }
        return out.length() == 0 ? null : out.toString();
    }
}
