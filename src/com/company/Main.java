package com.company;

import java.io.IOException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Sorting.userInput(scanner.nextLine());
//        String name;
//        String sorce = null;
//        String moreDetails = null;
//        name = scanner.nextLine();
//        name = name.replaceAll(" ","+");
//        try {
//             sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.services/?s=" +name));
//             if (sorce!= null)
//             moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
//   } catch (IOException e) {
//            e.printStackTrace();
//            System.out.println("net problem");
//        }
//        if(sorce != null || moreDetails != null){
//            String summery = StringCheckUpManager.getSummery(sorce);
//            String IMDBrating = StringCheckUpManager.getIMDBscore(sorce);
//            String genre = StringCheckUpManager.getGenre(sorce);
//            String fullSummery = StringCheckUpManager.moreDetaildSummery(moreDetails);
//            String imageUrl = StringCheckUpManager.getImageUrl(sorce);
//            String IMDB_best = StringCheckUpManager.IMDB_best_ever(sorce);
//            String actors = StringCheckUpManager.findingActors(moreDetails);
//            System.out.println("actors : " + actors);
//            System.out.println("IMDB score : " + IMDB_best);
//            System.out.println("full summery : " + fullSummery);
//            System.out.println("IMDB rating: " + IMDBrating);
//            System.out.println("image URL : " + imageUrl);
//            System.out.println(genre);
//            System.out.println(summery);
//        }
//        else {
//            System.out.println("no connection! or ridi ba searchet :|");
//        }
    }
}
