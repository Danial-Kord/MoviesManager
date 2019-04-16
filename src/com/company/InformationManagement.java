package com.company;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class InformationManagement {
    private ArrayList<Movie> getMovies(String path) {
        File folder = new File(path);
        if (folder.isDirectory()) {
            File[] files = folder.listFiles();
            ArrayList<Movie> movies = new ArrayList<Movie>();
            for (File file : files) {
                if (file.isDirectory())
                        movies.add(new Movie(file.getName(), Sorting.getYear(file.getName()), file.getAbsolutePath()));
            }
            System.out.println(movies.size());
            return movies;
        } else {
            System.out.println("wrong path");
            return null;
        }
    }

    public void addInformation(String path,Information information) {
        Sorting.userInput(path);
        if(!information.samePath(path)) {
            System.out.println(".....?");
            information.addPath(path);
            information.addMovies(getMovies(path));
            for (Movie movie : information.getMovies()) {
                System.out.println("why");
                movie = searchResults(movie);
            }
        }
        else {
            for (Movie movie : information.getMovies()) {
                movie.print();
            }
        }
    }

    private Movie searchResults(Movie movie) {
        System.out.println("search time");
        if (movie.getYear().equals("")) {
            System.out.println("year none");
            return movie;
        }
        String name;
        String sorce = null;
        String moreDetails = null;
        name = movie.getName().replaceAll(" ", "+");
        try {
            sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.services/?s=" + name));
            if (sorce != null)
                moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("net problem");
        }
        try {
            if (sorce != null || moreDetails != null) {
                movie.setSummery(StringCheckUpManager.getSummery(sorce));
                movie.setIMDBrating(StringCheckUpManager.getIMDBscore(sorce));
                movie.setGenre(StringCheckUpManager.getGenre(sorce));
                movie.setFullSummery(StringCheckUpManager.moreDetaildSummery(moreDetails));
//                String imageUrl = StringCheckUpManager.getImageUrl(sorce);//TODO image
                movie.setIMDBscore(StringCheckUpManager.IMDB_best_ever(sorce));
                movie.setActors(StringCheckUpManager.findingActors(moreDetails));
            } else {
                System.out.println("no connection! or ridi ba searchet :|");
            }
        } catch (IndexOutOfBoundsException | NumberFormatException e) {
            System.out.println("site formating has been changed!");
        }
        return movie;
    }
}
