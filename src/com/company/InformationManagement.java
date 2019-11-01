package com.company;

import UI.Gui;
import UI.ProgressPane;
import javafx.concurrent.Task;
import javafx.concurrent.WorkerStateEvent;
import javafx.event.EventHandler;
import javafx.scene.Parent;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;

public class InformationManagement {
    private boolean isReading = false;
    private static HashSet<String> availableDrivers = new HashSet<String>();
    public static void findAvailablePaths(){
        //FileSystemView fsv = FileSystemView.getFileSystemView();
        File[] drives = File.listRoots();
        for (int i= drives.length-1;i>=0;i--){
            availableDrivers.add(""+drives[i].getAbsolutePath().substring(0,drives[i].getAbsolutePath().indexOf(":")));

        }
    }

    public static HashSet<String> getAvailableDrivers() {
        return availableDrivers;
    }

    private ArrayList<Movie> getMovies(String path, Information information) {

        System.out.println("movie numbers" + information.getMovies().size());

        boolean dan = true;
        File folder = new File(path);
        if(!Information.isPathExist(path)) {
            dan = false;
            for (String temp : availableDrivers){
                path = path.replace(path.substring(0,path.indexOf(":")),temp);
                System.out.println("ddddddddddddddddiiiiiiiiiiiiiiiiiiiiiii");
                System.out.println(path);
                folder = new File(path);
                if(Information.isPathExist(path)) {
                    folder = new File(path);
                    break;
                }
            }
        }
      //  if(true)
      //  return null;
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
//                                    && movies.get(i).getPath().equals(file.getAbsolutePath())TODO changed

                            ) {
                                information.getMovies().get(i).setPath(file.getAbsolutePath());
                                flag = true;
                                break;
                            }
                        }
                        catch (IndexOutOfBoundsException e)
                        {
                            flag = true;
                            break;
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

//        for (int i=0;i<information.getMovies().size();i++){
//            gui.updateOrAddMediaContent(information.getMovies().get(i));
//        }
//        gui.setActivePaneContent(gui.getAllMediaContents());

//        gui.findAll();

        for (int i=information.getPaths().size()-1;i>=0;i--) {
            final String path = information.getPaths().get(i);
            if( path.equals("") || path==null) {
//                information.getPaths().remove(information.getPaths().get(i));
//                i--;
                continue;
            }

           // gui.findAll();
//            if(true)
//                return;
//             ProgressPane pBar = new ProgressPane(movies.size());
//             final ProgressBar progressBar = pBar.getProgressBar();
            Task<Parent> yourTaskName = new Task<Parent>() {
                @Override
                public Parent call() {
                    System.out.println("path numbers" + information.getPaths().size());

                    final ArrayList<Movie> movies = getMovies(path,information);

                    information.addMovies(movies);
                    System.out.println("final movie add size " +movies.size());

//                    gui.findAll();
                    int i=0;
                    FindInfoFromNet.siteChange();
                    for (int v=information.getMovies().size()-1;v>=0;v--) {
                        //TODO changed movies
                        Movie movie = information.getMovies().get(v);
                        System.out.println("<><><>"+movie.getName()+"     "+movie.isShow());
                        if(!Sorting.isPathExist(movie.getFolderPath()) || !movie.isShow())
                            continue;

                        System.out.println("is here");
                        System.out.println(movie.getName());
                        System.out.println(movie.getYear());
                        movie = FindInfoFromNet.searchResults(movie);
                        System.out.println("wtf");

                        updateProgress(i,movies.size());
                        i++;
                        if(i%5 == 1) {
                            i=0;
                            gui.updateOrAddMediaContent(movie);
                        }
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
//                    Gui.root.setDisable(false);
//                    gui.setActivePaneContent(mediaContents,0);
                    gui.getLoadingText().setVisible(false);
                    gui.getProgressBar().setVisible(false);
//                    gui.findAll();
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
