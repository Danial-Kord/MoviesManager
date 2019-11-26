package com.company;

import dataBase.DBCoonection;
import dataBase.InsertManager;
import dataBase.SQLDmlManager;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;

public class InfoSaver {//TODO default
    //TODO save movies that couldn't find their info

    public static boolean save(Information information){
        return save(information,Information.path);
    }
    public static boolean save(Information information,String path) {
        if(information == null)
            return false;
        File save = new File(path + "\\" + "MovieManager.DMM");
        try (FileOutputStream fileOutputStream = new FileOutputStream(save.getPath())) {
            try {
                ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
                objectOutputStream.writeObject(information);
                objectOutputStream.flush();
                objectOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }
    public static void saveFromText(Information information){
        saveFromText(information,Information.path);
    }

        public static String getAllInfo(Movie movie){
        String out = movie.getName()+"@DKM"+movie.getYear()+"@DKM"+movie.getIMDBscore()+"@DKM"+movie.getIMDBrating()+"@DKM"+
                movie.getFullSummery()+"@DKM"+movie.getSummery()+"@DKM"+
                movie.getActors()+"@DKM"+movie.getDirectors()+"@DKM"+movie.getPath()+"@DKM"+movie.getGenre()+"@DKM"+
                movie.getImagePath()+"@DKM"+movie.getFolderPath()+"@DKM"+movie.isShow()+"@DKM"+movie.isUpdatedFromNet()
                +"@DKM"+movie.isFavoriteMovie()+"@DKM"+movie.getDuration()+"@DKM"+movie.getNumberOfVotes()+"@DKM"+
                movie.isUpdated2()+"@DKM";
        for (String temp : movie.getPaths()) {
            out+="@DKM"+temp;
        }
        for (String temp : movie.getFavorites()) {
            out+="@DKM"+temp;
        }
        out+="\n";
        return out;
    }
    public static void saveFromText(Information information,String path){
        File file = new File(path+"\\InformationDDM.txt");

        try {
//            RandomAccessFile writer = new RandomAccessFile(path+"\\InformationDDM.txt", "rw");
//            writer.writeUTF(Information.path +" "+Information.path2+"\n");
//            writer.writeUTF("Movies info start\n");
//            for (int i=0;i<information.getMovies().size();i++){
//                writer.writeUTF(getAllInfo(information.getMovies().get(i)));
//            }
//            writer.writeUTF("Movies info ended\n");
//
//            writer.writeUTF("paths info start\n");
//            for (int i=0;i<information.getMovies().size();i++){
//                writer.writeUTF(information.getPaths().get(i)+"@DKM");
//            }
//            writer.writeUTF("\npaths info ended\n");

            FileOutputStream outputStream = new FileOutputStream(path+"\\InformationDDM.txt");
            String temp = Information.path +" "+Information.path2+"\n";
            byte[] strToBytes = temp.getBytes();
            outputStream.write(strToBytes);
            temp = "Movies info start\n";
            strToBytes = temp.getBytes();
            outputStream.write(strToBytes);
            for (int i=0;i<information.getMovies().size();i++){
                outputStream.write(getAllInfo(information.getMovies().get(i)).getBytes());
            }
            temp = "\nMovies info ended\n";
            strToBytes = temp.getBytes();
            outputStream.write(strToBytes);

            temp = "paths info start\n";
            strToBytes = temp.getBytes();
            outputStream.write(strToBytes);
            for (int i=0;i<information.getPaths().size();i++){
                temp = information.getPaths().get(i)+"@DKM";
                strToBytes = temp.getBytes();
                outputStream.write(strToBytes);
            }
            temp = "\npaths info ended\n";
            strToBytes = temp.getBytes();
            outputStream.write(strToBytes);
            outputStream.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
    public static Information readFromText(){
        Information information = new Information();

        String path="";
        File save2 = new File(Information.path2 + "\\" + "MovieManager.DMM");

        File save1 = new File(Information.path + "\\" + "MovieManager.DMM");

        if(save1.exists() && !save2.exists()){
            path = Information.path;
        }
        else if(save2.exists() && !save1.exists()){
            path = Information.path2;
        }
        else{
            if(save1.length() > save2.length())
                path = Information.path;
            else
                path = Information.path2;
        }
        FileInputStream inputStream = null;
        Scanner sc = null;
        try {
            inputStream = new FileInputStream(path);
            sc = new Scanner(inputStream, "UTF-8");
            while (sc.hasNextLine()) {
                String line = sc.nextLine();
                // System.out.println(line);
            }
            // note that Scanner suppresses exceptions
            if (sc.ioException() != null) {
                throw sc.ioException();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (sc != null) {
                sc.close();
            }
        }
        return information;
    }


    public static Information read(){
        //method1
        Information information = new Information();
        File save = null;
        File save2 = new File(Information.path2 + "\\" + "MovieManager.DMM");

        File save1 = new File(Information.path + "\\" + "MovieManager.DMM");

        if(save2.exists()){
            save = save1;
        }
        else if(save1.exists()){
            save = save2;
        }
        if(save != null)
        if(save.exists()) {
            try (FileInputStream fileInputStream = new FileInputStream(save.getPath())) {
                try {
                    ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
                    information = (Information) (objectInputStream.readObject());
                    information.setMovies((ArrayList<Movie>) information.getMovies().clone());
                    objectInputStream.close();
                    save(information,Information.initialPAth2());
                } catch (IOException | ClassNotFoundException e) {
                    e.printStackTrace();
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println("?????");
        }

//        DBCoonection.connect();TODO feature
//        InsertManager.insertMovie(information.getMovies().get(0));
//
//        Scanner scanner = new Scanner(System.in);
//        scanner.next();
        saveFromText(information);
        return information;
    }

}