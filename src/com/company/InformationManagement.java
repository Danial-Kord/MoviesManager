package com.company;

import UI.Gui;
import UI.MediaContent;
import UI.ProgressPane;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.concurrent.WorkerStateEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.VBox;

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
                        try {

                            if (information.getMovies().get(i).getName().equals(Sorting.findName(file))
                                    && information.getMovies().get(i).getYear().equals(Sorting.getYear(file.getName()))
                                    && movies.get(i).getPath().equals(file.getAbsolutePath())) {
                                flag = true;
                                break;
                            }
                        }
                        catch (IndexOutOfBoundsException e)
                        {
                            flag = true;
                        } }
                    if(!flag)
                        movies.add(new Movie(Sorting.findName(file), Sorting.getYear(file.getName()), file.getAbsolutePath()));
                }
            }
            System.out.println("why : "+movies.size());
            return movies;
        } else {
            System.out.println("wrong path");
            return null;
        }
    }

    public void checkNewMovies(final Information information, final Gui gui){
        for (int i=0;i<information.getPaths().size();i++) {
            String path = information.getPaths().get(i);
            if(!information.isPathExist(path) || path.equals("") || path==null) {
//                information.getPaths().remove(information.getPaths().get(i));
//                i--;
                continue;
            }
            System.out.println("path numbers" + information.getPaths().size());

            final ArrayList<Movie> movies = getMovies(path,information);
            information.addMovies(movies);

            gui.findAll();
//             ProgressPane pBar = new ProgressPane(movies.size());
//             final ProgressBar progressBar = pBar.getProgressBar();
            Task<Parent> yourTaskName = new Task<Parent>() {
                @Override
                public Parent call() {
                    int i=0;
                    for (Movie movie : information.getMovies()) {//TODO changed movies
                        if(movie.isUpdatedFromNet())
                            continue;
                        System.out.println("is here");
                        System.out.println(movie.getName());
                        System.out.println(movie.getYear());
                        movie = FindInfoFromNet.searchResults(movie);
                        System.out.println("wtf");

                        updateProgress(i,movies.size());
                        i++;
                        i++;
                            gui.updateOrAddMediaContent(movie);
                            i = 0;
                    }
                    System.out.println("end of process");
                    return null;
                }

                @Override
                protected void updateProgress(double v, double v1) {

                }
            };
//
            yourTaskName.setOnSucceeded(new EventHandler<WorkerStateEvent>() {
                @Override
                public void handle(WorkerStateEvent event) {
                    Gui.root.setDisable(false);
//                    gui.setActivePaneContent(mediaContents,0);
                    gui.getLoadingText().setVisible(false);
                    gui.getProgressBar().setVisible(false);
                    gui.findAll();
                    InfoSaver.save(information);
                    System.out.println("absoulotly finished");
                }
            });
            gui.getLoadingText().setVisible(true);
            gui.getProgressBar().setVisible(true);
            gui.getProgressBar().progressProperty().bind(yourTaskName.progressProperty());
            Thread loadingThread = new Thread(yourTaskName);
            loadingThread.start();





//            final ProgressPane progressPane =  new ProgressPane(information.getMovies().size());
//            Platform.runLater(new Runnable() {
//                @Override
//                public void run() {
//
//                    int i=0;
//                    for (Movie movie : movies) {
//                        System.out.println("is here");
//                        System.out.println(movie.getName());
//                        System.out.println(movie.getYear());
//                        movie = FindInfoFromNet.searchResults(movie);
////                        progressPane.increase();
//                        mediaContents.add(new MediaContent(movie));
//                        i++;
////                        if(i == 5) {
////                            gui.setActivePaneContent(mediaContents, 0);
////                            i = 0;
////                        }
//                    }
//
//                    Gui.root.setDisable(false);
//                    gui.setActivePaneContent(mediaContents,0);
//                    InfoSaver.save(information);
//                }
//            });
        }
    }
    public void addInformation(String path, final Information information) {
//        Sorting.userInput(path);
        if(!information.samePath(path)) {
            information.addPath(path);
            information.addMovies(getMovies(path,information));
                final ProgressPane progressPane =  new ProgressPane(information.getMovies().size());
//                Thread thread = new Thread(){
//                    @Override
//                    public void run() {
                        for (Movie movie : information.getMovies()) {
                            System.out.println("is there");
                            System.out.println(movie.getName());
                            System.out.println(movie.getYear());
                            movie = FindInfoFromNet.searchResults(movie);
                            for (String favorite : movie.getFavorites()) {
                                System.out.println("<<<<"+favorite);
                                information.addCategoryType(favorite);
                            }
                            progressPane.increase();
                        }
//                    }
//                };
//                thread.start();
        }
        else {
//            for (Movie movie : information.getMovies()) {
//                movie.print();
//            }
        }
    }
}
