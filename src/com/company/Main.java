package com.company;

import mslinks.ShellLink;

import java.io.IOException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Information information = InfoSaver.read();
    InformationManagement informationManagment = new InformationManagement();
    informationManagment.addInformation(scanner.nextLine(),information);
    informationManagment.checkNewMovies(information);
    information.buildShortCuts();
    InfoSaver.save(information);
//        Sorting.userInput(scanner.nextLine());







    }
}