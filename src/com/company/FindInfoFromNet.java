package com.company;

import java.io.IOException;

public class FindInfoFromNet {
    public static Movie searchResults(Movie movie) {
        if (movie.getYear().equals("")) {
            return movie;
        }
        String name;
        String sorce = null;
        String moreDetails = ":)";
        name = movie.getName().replaceAll(" ", "+");
        try {
            sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.digital/?s=" + name));
            System.out.println("Dadadada");
//            if (sorce != null)
//                moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("net problem");
        }
        try {
            if (sorce != null || moreDetails != null) {
                if(sorce!=null) {
                    movie.setSummery(StringCheckUpManager.getSummery(sorce));
                    movie.setIMDBrating(StringCheckUpManager.getIMDBscore(sorce));
                    movie.setGenre(StringCheckUpManager.getGenre(sorce));
//                String imageUrl = StringCheckUpManager.getImageUrl(sorce);//TODO image
                    movie.setIMDBscore(StringCheckUpManager.IMDB_best_ever(sorce));

                }
                else {
//                movie.setActors(StringCheckUpManager.findingActors(moreDetails));
//                movie.setFullSummery(StringCheckUpManager.moreDetaildSummery(moreDetails));
                }
            } else {
                System.out.println("no connection! or ridi ba searchet :|");
            }
        } catch (IndexOutOfBoundsException | NumberFormatException e) {
            System.out.println("site formating has been changed!");
        }
        return movie;
    }
}
