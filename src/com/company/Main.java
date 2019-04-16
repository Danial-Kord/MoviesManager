package com.company;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Information information = InfoSaver.read();
    InformationManagement informationManagment = new InformationManagement();
    informationManagment.addInformation(scanner.nextLine(),information);
    InfoSaver.save(information);
    }
}

