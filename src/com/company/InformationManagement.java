package com.company;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class InformationManagement {
    private ArrayList<Movie> getMovies(String path,Information information) {
        File folder = new File(path);
        if (folder.isDirectory()) {
            File[] files = folder.listFiles();
            ArrayList<Movie> movies = new ArrayList<Movie>();
            for (File file : files) {
                if (file.isDirectory()) {
                    boolean flag=false;
                    for (int i = 0; i < information.getMovies().size();i++) {
                        if(information.getMovies().get(i).getName() ==file.getName() && information.getMovies().get(i).getYear() == Sorting.getYear(file.getName()) && movies.get(i).getPath() == file.getAbsolutePath()){
                            flag = true;
                            break;
                        }
                    }
                    if(!flag)
                        movies.add(new Movie(file.getName(), Sorting.getYear(file.getName()), file.getAbsolutePath()));
                }
            }
            System.out.println(movies.size());
            return movies;
        } else {
            System.out.println("wrong path");
            return null;
        }
    }

    public void checkNewMovies(Information information){
        for (String path : information.getPaths()) {
            ArrayList<Movie> movies = getMovies(path,information);
            information.addMovies(movies);
            for (Movie movie : movies) {
                System.out.println(movie.getName());
                System.out.println(movie.getYear());
                movie = searchResults(movie);
            }
        }
    }
    public void addInformation(String path,Information information) {
        Sorting.userInput(path);
        if(!information.samePath(path)) {
            information.addPath(path);
            information.addMovies(getMovies(path,information));
            for (Movie movie : information.getMovies()) {
                System.out.println(movie.getName());
                System.out.println(movie.getYear());
                movie = searchResults(movie);
                for (String favorite : movie.getFavorites()) {
                    System.out.println("<<<<"+favorite);
                    information.addCategoryType(favorite);
                }
            }
        }
        else {
//            for (Movie movie : information.getMovies()) {
//                movie.print();
//            }
        }
    }

    private Movie searchResults(Movie movie) {
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
