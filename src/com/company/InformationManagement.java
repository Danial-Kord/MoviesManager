package com.company;

import UI.ProgressPane;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class InformationManagement {
    private ArrayList<Movie> getMovies(String path,Information information) {

        System.out.println("movie numbers" + information.getMovies().size());

        File folder = new File(path);
        if (folder.isDirectory()) {
            ArrayList<File>files = new ArrayList<File>();
            files = DirCleaner.getMovies(folder,files);
            ArrayList<Movie> movies = new ArrayList<Movie>();
            for (File file : files) {
                if (!file.isDirectory() && Sorting.isMovie(file)) {
                    boolean flag=false;
                    for (int i = 0; i < information.getMovies().size();i++) {
                        System.out.println(i);
                        System.out.println("name : "+information.getMovies().get(i).getName());
                        System.out.println("name : "+Sorting.findName(file));
                        if(information.getMovies().get(i).getName().equals(Sorting.findName(file))
                                && information.getMovies().get(i).getYear().equals(Sorting.getYear(file.getName()))
                                && movies.get(i).getPath().equals(file.getAbsolutePath())){
                            flag = true;
                            break;
                        }
                    }
                    if(!flag)
                        movies.add(new Movie(file.getName(), Sorting.getYear(file.getName()), file.getAbsolutePath()));
                }
            }
            System.out.println("why : "+movies.size());
            return movies;
        } else {
            System.out.println("wrong path");
            return null;
        }
    }

    public void checkNewMovies(Information information){
        for (int i=0;i<information.getPaths().size();i++) {
            String path = information.getPaths().get(i);
            if(!information.isPathExist(path)) {
//                information.getPaths().remove(information.getPaths().get(i));
//                i--;
                continue;
            }
            System.out.println("path numbers" + information.getPaths().size());

            ArrayList<Movie> movies = getMovies(path,information);
            information.addMovies(movies);
            for (Movie movie : movies) {
                System.out.println(movie.getName());
                System.out.println(movie.getYear());
                movie = FindInfoFromNet.searchResults(movie);
            }
        }
    }
    public void addInformation(String path,Information information) {
//        Sorting.userInput(path);
        if(!information.samePath(path)) {
            information.addPath(path);
            information.addMovies(getMovies(path,information));
                ProgressPane progressPane =  new ProgressPane(information.getMovies().size());
//                new Thread(){
//                    @Override
//                    public void run() {
//
//                    }
//                };
            for (Movie movie : information.getMovies()) {
                System.out.println(movie.getName());
                System.out.println(movie.getYear());
                movie = FindInfoFromNet.searchResults(movie);
                for (String favorite : movie.getFavorites()) {
                    System.out.println("<<<<"+favorite);
                    information.addCategoryType(favorite);
                }
                progressPane.increase();
            }
        }
        else {
//            for (Movie movie : information.getMovies()) {
//                movie.print();
//            }
        }
    }
}
