package com.company;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;

public class Movie implements Serializable {

    private String name="";
    private String year="";
    private String IMDBscore="";
    private String IMDBrating="";
    private String fullSummery="";
    private String summery="";
    private String actors="";
    private String directors="";
    private String path="";
    private String genre="";
    private String imagePath="";
    private String folderPath="";
    private boolean show=true;
    private boolean isUpdatedFromNet = false;
    private Date lastUpdate = null;
    private boolean favoriteMovie = false;
    private String duration="";
    private String enSummery="";
    private String numberOfVotes="";
    private boolean isUpdated2=false;
    private String sorce="";
    private String sorce2="";
    private HashSet<String>paths;
    private HashSet<String>favorite;//choose some categories for your movie that you want to add that shortcut in there.
    public Movie(String name, String year,String path) {
        this.name = name;
        this.year = year;
        favorite = new HashSet<String>();
        paths = new HashSet<String>();
        setPath(path);
    }


    public Movie(String name, String year, String IMDBscore, String IMDBrating, String fullSummery, String summery, String actors) {
        favorite = new HashSet<String>();
        paths = new HashSet<String>();
        this.name = name;
        this.year = year;
        this.IMDBscore = IMDBscore;
        this.IMDBrating = IMDBrating;
        this.fullSummery = fullSummery;
        this.summery = summery;
        this.actors = actors;
    }


    public void addCategory(String path){
        favorite.add(path);
    }

    public HashSet<String> getPaths() {
        return paths;
    }
//    public String getAllInfo(){
//        String out = name+"@DKM"+year+"@DKM"+IMDBscore+"@DKM"+IMDBrating+"@DKM"+fullSummery+"@DKM"+summery+"@DKM"+
//                actors+"@DKM"+directors+"@DKM"+path+"@DKM"+genre+"@DKM"+imagePath+"@DKM"+folderPath+"@DKM"+show+"@DKM"+isUpdatedFromNet
//                +lastUpdate+"@DKM"+favoriteMovie+"@DKM"+duration+"@DKM"+numberOfVotes+"@DKM"+isUpdated2+"@DKM"+sorce+"@DKM"+sorce2;
//        for (String temp : paths) {
//            out+="@DKM"+temp;
//        }
//        for (String temp : favorite) {
//            out+="@DKM"+temp;
//        }
//        out+="\n";
//        return out;
//    }
    public HashSet<String> getFavorites() {
        return favorite;
    }

    public void setEnSummery(String enSummery) {
        this.enSummery = enSummery;
    }

    public String getEnSummery() {
        return enSummery;
    }

    public void setNumberOfVotes(String numberOfVotes) {
        this.numberOfVotes = numberOfVotes;
    }

    public String getNumberOfVotes() {
        return numberOfVotes;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public void setLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public void setUpdatetFromNet(boolean updatetFromNet) {
        isUpdatedFromNet = updatetFromNet;
    }

    public void setUpdated2(boolean updated2) {
        isUpdated2 = updated2;
    }

    public void setSorce(String sorce) {
        this.sorce = sorce;
    }

    public String getSorce() {
        return sorce;
    }

    public void setSorce2(String sorce2) {
        this.sorce2 = sorce2;
    }

    public String getSorce2() {
        return sorce2;
    }

    public boolean isUpdated2() {
        return isUpdated2;
    }

    public String getName() {
        return name;
    }

    public boolean isShow() {
        return show;
    }

    public void setShow(boolean show) {
        this.show = show;
    }

    public String getYear() {
        return year;
    }

    public String getIMDBscore() {
        return IMDBscore;
    }

    public String getIMDBrating() {
        return IMDBrating;
    }

    public String getFullSummery() {
        return fullSummery;
    }

    public String getSummery() {
        return summery;
    }

    public void setGenre(String genre) {
        this.genre = genre;
//        String[]regex = genre.split(",");
//        for (String temp : regex) {
//            if(temp!= null&& temp!= "")
//            addCategory(temp);
//        }
    }

    public String getGenre() {
        return genre;
    }

    public String getImagePath() {
        return imagePath;
    }

    public String getActors() {
        return actors;
    }

    public String getDirectors() {
        return directors;
    }

    public void setPath(String path) {
        this.path = path;
        folderPath = path.substring(0,path.lastIndexOf("\\"));
        paths.add(folderPath);
    }
    public String getPath() {
        return path;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public void setIMDBscore(String IMDBscore) {
        this.IMDBscore = IMDBscore;

    }

    public String getFolderPath() {
        return folderPath;
    }

    public void setIMDBrating(String IMDBrating) {
        this.IMDBrating = IMDBrating;
    }

    public void setFavoriteMovie(boolean favoriteMovie) {
        this.favoriteMovie = favoriteMovie;
    }

    public boolean isFavoriteMovie() {
        return favoriteMovie;
    }

    public void setFullSummery(String fullSummery) {
        this.fullSummery = fullSummery;
    }

    public void setSummery(String summery) {
        this.summery = summery;
    }

    public void setActors(String actors) {
        this.actors = actors;
    }

    public boolean isUpdatedFromNet() {
        return isUpdatedFromNet;
    }

    public void setDirectors(String directors) {
        this.directors = directors;
    }
    public void print(){
        System.out.println(summery);
        System.out.println(actors);
        System.out.println(fullSummery);
        System.out.println(IMDBrating);
        System.out.println(IMDBscore);
        System.out.println(year);
        System.out.println(name);
        System.out.println(path);
        System.out.println(genre);
    }

}
