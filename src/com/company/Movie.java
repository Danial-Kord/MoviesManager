package com.company;

import java.util.ArrayList;

public class Movie {
    private String name;
    private String year;
    private String IMDBscore;
    private String IMDBrating;
    private String fullSummery;
    private String summery;
    private String actors;
    private String directors;

    public Movie(String name, String year) {
        this.name = name;
        this.year = year;
    }

    public Movie(String name, String year, String IMDBscore, String IMDBrating, String fullSummery, String summery, String actors) {
        this.name = name;
        this.year = year;
        this.IMDBscore = IMDBscore;
        this.IMDBrating = IMDBrating;
        this.fullSummery = fullSummery;
        this.summery = summery;
        this.actors = actors;
    }

    public String getName() {
        return name;
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

    public String getActors() {
        return actors;
    }

    public String getDirectors() {
        return directors;
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

    public void setIMDBrating(String IMDBrating) {
        this.IMDBrating = IMDBrating;
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

    public void setDirectors(String directors) {
        this.directors = directors;
    }
}
