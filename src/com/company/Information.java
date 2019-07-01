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
    public HashSet<String>categoriesTyps;
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
                        if ((Information.categoriesPath + "\\" + target).equals(Information.categoriesPath))
                            ShellLink.createLink(movie.getPath(), Information.categoriesPath + "\\" + "all" + "\\" + movie.getName() + ".lnk");
                        else
                            ShellLink.createLink(movie.getPath(), Information.categoriesPath + "\\" + target + "\\" + movie.getName() + ".lnk");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
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
