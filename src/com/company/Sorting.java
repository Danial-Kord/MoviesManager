package com.company;

import javax.swing.*;
import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Scanner;

public class Sorting {
    public static ArrayList<String>stringConditions= new ArrayList<String>();
    public static void userInput(String path) {
        buildConditions();
        userInput(path, stringConditions);
    }
    public static void buildConditions(){

        stringConditions.add("256");
        stringConditions.add("264");
        stringConditions.add("255");
        stringConditions.add("480");
        stringConditions.add("20");
        stringConditions.add("19");
        stringConditions.add("21");
        stringConditions.add("22");
        stringConditions.add("1080");
        stringConditions.add("720");
        stringConditions.add(".mkv");
        stringConditions.add(".mp4");
        stringConditions.add(".mpeg");
        stringConditions.add(".mpeg2");
        stringConditions.add("bluray");
        stringConditions.add("hdrip");
        stringConditions.add("hdcam");
        stringConditions.add("hdtv");
        stringConditions.add("4k");
        stringConditions.add("web");
        stringConditions.add(".avi");
    }
    public static void userInput(String path, ArrayList<String> in) {
        DirCleaner.buildNewFolder(path);
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter the file path: ");
        String dirPath = path; // Takes the directory path as the user input
        ArrayList<String> input = in;
        stringConditions = in;
        File folder = new File(dirPath);
        if (folder.isDirectory()) {
            File[] fileList = folder.listFiles();

            Arrays.sort(fileList);

            System.out.println("\nTotal number of items present in the directory: " + fileList.length);


            // Lists only files since we have applied file filter
            for (File file : fileList) {
                if(!file.isDirectory())
                if (isMovie(file)) {
                    String year = getYear(file.getName());
                    String temp = findName(file);
                    temp += " " + year;
                    while (temp.endsWith(" ")) {
                        temp = temp.substring(0, temp.length() - 1);
                    }
                    System.out.println(temp + "..............." + year);
                    File dir = new File(dirPath + "\\" + temp);
                    dir.mkdir();
                    File destination = new File(dir.getAbsolutePath() + "\\" + file.getName());
                    System.out.println(destination.getPath());
                    if (!destination.exists()) {
                        if (file.renameTo(destination)) {
                            file.delete();
                        }
                    } else {
                        System.out.println("ERROR : " + file.getName());
                    }
                }
            }

            File[] files = folder.listFiles();
            for (File file : files) {
                if (file.getName().endsWith(".srt") || file.getName().endsWith(".ass")) {
                    for (File file1 : folder.listFiles()) {
                        if (file1.isDirectory()) {
                            if (checkSameName(file1.getName(), file.getName(),input)) {
                                File dir = new File(file1.getPath());
                                File destination = new File(dir.getAbsolutePath() + "\\" + file.getName());
                                if (file.renameTo(destination)) {
                                    file.delete();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    private static boolean checkSameName(String name ,String subtitleName,ArrayList<String>input){
        String year = getYear(subtitleName).replace(" ","");
        subtitleName = subtitleName.substring(0, index(input, subtitleName));
        if(getYear(name).replace(" ","").equals(year) || year.equals("") || getYear(name).equals("")) {
            name = name.substring(0, index(input, name)).replace(" ","");
            subtitleName = subtitleName.replace(".","").replace("-","").replace("_","").replace("(","")
                    .replace(")","").replace(" ","");
            char[] nameArray = name.toLowerCase().toCharArray();
            for (int i=0;i<name.length();i++){
                if(!subtitleName.toLowerCase().contains(""+nameArray[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;

    }
        private static ArrayList<String> input () {
            ArrayList<String> input = new ArrayList<String>();
            boolean flag = true;
            Scanner scanner = new Scanner(System.in);
            System.out.printf("Enter your file filtering : file ends with \n(it build a folder from start name of file and ends with your input):");
            while (flag) {
                input.add(scanner.nextLine());
                System.out.printf("for ending yor input type---> END ");
                if (input.get(input.size() - 1).equals("END"))
                    flag = false;
            }
            return input;
        }
        private static int index (ArrayList < String > in, String file){
            int f = file.length();
            for (int i = 2; i < file.length(); i++) {
                boolean flag = false;
                if (i > 0) {
                    String temp = file.toLowerCase();
                    for (int j = 0; j < in.size(); j++) {
                        if (temp.substring(2, i).endsWith(in.get(j))) {
                            f = i - in.get(j).length();
                            flag = true;
                            break;
                        }
                    }
                }
                if (flag)
                    break;
            }
            return f;
        }
        public static String getYear (String in){
            char[] temp = in.toCharArray();
            if (in.contains("20") || in.contains("19") || in.contains("21") || in.contains("22")) {
                for (int i = 2; i < in.length() && i + 2 < in.length(); i++) {
                    String q = "" + temp[i-1] + temp[i];
                    if (q.equals("20") || q.equals("19") || q.equals("21") || q.equals("22")) {
                        return "" + q + temp[i + 1] + temp[i + 2];
                    }
                }
            }
            return "";
        }
        public static boolean isMovie(File file){
                if(file.getName().toLowerCase().endsWith(".mkv") || file.getName().toLowerCase().endsWith(".mp4")
                        || file.getName().toLowerCase().endsWith(".mpeg") ||
                        file.getName().toLowerCase().endsWith(".mpeg2") || file.getName().toLowerCase().endsWith(".avi"))
                    return true;
                return false;
        }
        public static String findName(File file) {
            if (isMovie(file)) {
                String temp1 = file.getName().substring(0, index(stringConditions, file.getName()));
                char[] temp2 = temp1.toCharArray();
                String temp = "";
                for (int i = 0; i < temp2.length; i++) {
                    if (i != temp2.length - 1) {//for buildinf=g dir currectly
                        if (temp2[i] == '.' || temp2[i] == '-' || temp2[i] == '_' || temp2[i] == ')' || temp2[i] == '(' || temp2[i] == '*') {
                            temp += ' ';
                        } else {
                            temp += temp2[i];
                        }
                    }
                }
                return temp;
            }
            return null;
        }
    }
