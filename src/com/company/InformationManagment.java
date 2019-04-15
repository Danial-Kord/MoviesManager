package com.company;

import java.io.File;
import java.util.ArrayList;

public class InformationManagment {
    public static ArrayList<Movie> getMovies(String path){
        File folder = new File(path);
        if (folder.isDirectory()) {
            File[] files = folder.listFiles();
            ArrayList<Movie>movies = new ArrayList<Movie>();
            for (File file : files) {
                if(file.isDirectory())
                    movies.add(new Movie(file.getName(),Sorting.getYear(file.getName())));
            }
            return movies;
        }
        else {
            System.out.println("wrong path");
            return null;
        }
    }
    public boolean addInformation(String path){
        Sorting.userInput(path);
        ArrayList<Movie> movies = getMovies(path);
    }
}
