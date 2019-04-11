package com.company;

import java.io.IOException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String name;
        String sorce = null;
        name = scanner.nextLine();
        name = name.replaceAll(" ","+");
        try {
             sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.services/?s=" +name));
   } catch (IOException e) {
            e.printStackTrace();
        }
        if(sorce != null){
            String summery = StringCheckUpManager.getSummery(sorce);
            String IMDBrating = StringCheckUpManager.getIMDBscore(sorce);
            String genre = StringCheckUpManager.getGenre(sorce);
            String imageUrl = StringCheckUpManager.getImageUrl(sorce);
            System.out.println("IMDB : " + IMDBrating);
            System.out.println("image URL : " + imageUrl);
            System.out.println(genre);
            System.out.println(summery);
        }
        else {
            System.out.println("no connection! or ridi ba searchet :|");
        }
    }
}
