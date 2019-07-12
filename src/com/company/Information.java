package com.company;

import mslinks.ShellLink;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;

public class Information implements Serializable {
    private  ArrayList<Movie> movies ;
    private  ArrayList<Movie>moviesWhioutYear;
    private  ArrayList<String> paths ;
    private  ArrayList<Boolean>thisPathIsdone ;//TODO
    public static final String path =  System.getProperty("user.home");
    public static String categoriesPath = path+"\\categories";
    public  HashSet<String>categoriesTyps = new HashSet<String>();;
    public Information() {
        categoriesTyps = new HashSet<String>();
        categoriesPath = path+"\\categories";
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
    public void addCategoryType(String in){
        categoriesTyps.add(in);
    }
    public static boolean isPathExist(String path){
        if(path==null)
            return false;
        if(path.equals(""))
            return false;
        File file = new File(path);
        if(file.exists())
            return true;
        return false;
    }
    public void buildShortCuts(){
        for (String categoryNames : categoriesTyps) {
            File file = new File(categoriesPath + "\\"+categoryNames);
            file.mkdir();
        }
        for (Movie movie : movies){
            if(movie.getFavorites().size()!=0) {
                for (String target : movie.getFavorites()) {
                    if(target.equals(""))
                        continue;
                    try {
                            ShellLink.createLink(movie.getPath(), Information.categoriesPath + "\\" + target + "\\" + movie.getName() + ".lnk");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
    public  void addPath(String path){
        if(!samePath(path))
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
            if(s.equals(path) || path.contains(s))//TODO
                return true;
        }
        return false;
    }
    public  void setPaths(ArrayList<String> paths) {
        this.paths = paths;
    }
}
