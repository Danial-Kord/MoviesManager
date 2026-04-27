package com.company.metadata;

import com.company.Information;
import com.company.Movie;
import com.company.StringCheckUpManager;
import com.company.UrlManager;

import java.io.IOException;
import java.net.UnknownHostException;

/**
 * Enriches movies by scraping 30nama-style HTML. Fragile if the site changes.
 */
public final class ThirtyNamaMovieMetadataProvider implements MovieMetadataProvider {

    /**
     * Resolves a mirror / base URL from a remote text file (original {@code siteChange} behavior).
     */
    public static void refreshBaseUrl() {
        String url = "http://filtering.ninja/link.txt";
        try {
            String sorce = UrlManager.getURLSource(url);
            if (sorce == null) {
                return;
            }
            String newOne = sorce.replaceAll(" ", "");
            if (!newOne.endsWith("/")) {
                newOne += "/";
            }
            System.out.println(newOne);
            if (!newOne.equals("")) {
                Information.siteURL = newOne;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Movie enrich(Movie movie) {
        if (movie.getYear().equals("") && !movie.getName().endsWith("mk")) {
            return movie;
        }
        String name;
        String sorce = null;
        String moreDetails = ":)";
        name = movie.getName();
        String[] strings = name.split(" ");
        name = "";
        for (int i = 0; i < strings.length; i++) {
            if (strings[i].toLowerCase().endsWith("s")) {
                name += strings[i].substring(0, strings[i].length() - 1);
            } else {
                name += strings[i];
            }
            name += " ";
        }
        name = name.replace("mk", "").replaceAll(" ", "+");

        name += "+" + movie.getYear() + "&sort=user_rate";
        System.out.println(name);
        try {
            if (!movie.isUpdatedFromNet()) {
                sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource(Information.siteURL + "?s=" + name));
                movie.setSorce(sorce);
            } else {
                sorce = movie.getSorce();
            }
            System.out.println("Dadadada");
        } catch (UnknownHostException e) {
            System.out.println("offline");
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("net problem");
        }

        System.out.println(movie.isUpdated2());
        if (sorce != null && !movie.isUpdated2()) {
            try {
                if (movie.getSorce2() == null || movie.getSorce2().equals("") || !movie.isUpdated2()) {
                    System.out.println(StringCheckUpManager.getMoreDetails(sorce));
                    moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
                    System.out.println(".....>>>>>>>>>>>>\n\n");
                    System.out.println(moreDetails);
                    System.out.println(".....<<<<<<<<<<<<<\n\n");
                } else {
                    moreDetails = movie.getSorce2();
                }
                if (moreDetails != null) {
                    try {

                        movie.setSorce2(moreDetails);

                        System.out.println("more details:");
                        movie.setActors(StringCheckUpManager.findingActors(moreDetails));
                        System.out.println("actors finished");
                        movie.setDirectors(StringCheckUpManager.getDirectors(moreDetails));
                        System.out.println("directors finished");
                        movie.setDuration(StringCheckUpManager.getHours(moreDetails));
                        System.out.println("time get");
                        movie.setNumberOfVotes(StringCheckUpManager.getNumberOfVotes(moreDetails));
                        System.out.println("numberOfVotes");
                        movie.setSorce2(StringCheckUpManager.moreDetaildSummery(moreDetails));
                        movie.setUpdated2(true);

                        movie.setSorce2("");
                    } catch (IndexOutOfBoundsException | NumberFormatException e) {
                        System.out.println("site formating2 has been changed!");
                    }
                }
            } catch (UnknownHostException e) {
                System.out.println("offline");
            } catch (IOException e) {
                e.printStackTrace();
                System.out.println("net problem");
            }

            try {
                if (sorce != null && !movie.isUpdatedFromNet()) {
                    if (sorce != null) {
                        movie.setSummery(StringCheckUpManager.getSummery(sorce));
                        movie.setIMDBrating(StringCheckUpManager.getIMDBscore(sorce));
                        movie.setGenre(StringCheckUpManager.getGenre(sorce));
                        System.out.println("genere get");
                        String imageUrl = StringCheckUpManager.getImageUrl(sorce);
                        System.out.println("image url get");
                        PosterDownloader.savePosterFromUrl(imageUrl, movie);
                        movie.setIMDBscore(StringCheckUpManager.IMDB_best_ever(sorce));
                        System.out.println("rating...");

                    }
                } else {
                    System.out.println("no connection! or ridi ba searchet :|");
                }
            } catch (IndexOutOfBoundsException | NumberFormatException e) {
                System.out.println("site formating has been changed!");
            }
        }
        return movie;
    }
}
