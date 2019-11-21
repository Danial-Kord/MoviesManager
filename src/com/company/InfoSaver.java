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
    public static Information read(){
        Information information = new Information();
        File save = null;
        File save2 = new File(Information.path2 + "\\" + "MovieManager.DMM");

        File save1 = new File(Information.path + "\\" + "MovieManager.DMM");

        if(save1.exists()){
            save = save1;
        }
        else if(save2.exists()){
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

        DBCoonection.connect();
        InsertManager.insertMovie(information.getMovies().get(0));

        Scanner scanner = new Scanner(System.in);
        scanner.next();
        return information;
    }
}