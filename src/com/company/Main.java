package com.company;

import mslinks.ShellLink;

import java.io.IOException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
//        Information information = InfoSaver.read();
//    InformationManagement informationManagment = new InformationManagement();
//    informationManagment.addInformation(scanner.nextLine(),information);
//    informationManagment.checkNewMovies(information);
//    information.buildShortCuts();
//    InfoSaver.save(information);
//        Sorting.userInput(scanner.nextLine());





        //test
        Movie movie = new Movie("coco","2017","");
        String name;
        String sorce = null;
        String moreDetails = null;
        name = "coco+2017";
        try {
            sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.digital/?s=" + name));
            System.out.println("Dadadada");
            if (sorce != null)
                moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("net problem");
        }
        try {
            if (sorce != null || moreDetails != null) {
                movie.setSummery(StringCheckUpManager.getSummery(sorce));
                movie.setIMDBrating(StringCheckUpManager.getIMDBscore(sorce));
                movie.setGenre(StringCheckUpManager.getGenre(sorce));
//                movie.setFullSummery(StringCheckUpManager.moreDetaildSummery(moreDetails));
////                String imageUrl = StringCheckUpManager.getImageUrl(sorce);//TODO image
                movie.setIMDBscore(StringCheckUpManager.IMDB_best_ever(sorce));
//                movie.setActors(StringCheckUpManager.findingActors(moreDetails));
            } else {
                System.out.println("no connection! or ridi ba searchet :|");
            }
        } catch (IndexOutOfBoundsException | NumberFormatException e) {
            System.out.println("site formating has been changed!");
        }



    }
}