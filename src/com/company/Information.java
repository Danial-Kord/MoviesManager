package com.company;

import java.io.Serializable;
import java.util.ArrayList;

public class Information implements Serializable {
    private  ArrayList<Movie> movies ;
    private  ArrayList<Movie>moviesWhioutYear;
    private  ArrayList<String> paths ;
    private  ArrayList<Boolean>thisPathIsdone ;//TODO
    public static final String path =  System.getProperty("user.home");

    public Information() {
        movies = new ArrayList<Movie>();
        moviesWhioutYear= new ArrayList<Movie>();
       paths = new ArrayList<String>();
       thisPathIsdone = new ArrayList<Boolean>();
    }

    public  ArrayList<Movie> getMovies() {
        return movies;
    }
    public  void addMovies(ArrayList<Movie>movies){
        for (Movie movie : movies) {
            this.movies.add(movie);
        }
    }
    public  void addPath(String path){
        paths.add(path);
    }
    public  void setMovies(ArrayList<Movie> movies) {
        this.movies = movies;
    }

    public  ArrayList<String> getPaths() {
        return paths;
    }
    public  boolean samePath(String path){
        for (String s : this.paths) {
            if(s.equals(path))//TODO
                return true;
        }
        return false;
    }
    public  void setPaths(ArrayList<String> paths) {
        this.paths = paths;
    }
}
