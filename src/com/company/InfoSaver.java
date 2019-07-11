package com.company;

import java.io.*;
import java.util.ArrayList;

public class InfoSaver {//TODO default
    //TODO save movies that couldn't find their info

    public static boolean save(Information information){
        return save(information,Information.path);
    }
    public static boolean save(Information information,String path) {
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
        File save = new File(Information.path + "\\" + "MovieManager.DMM");
        Information information = new Information();
        if(save.exists()) {
            try (FileInputStream fileInputStream = new FileInputStream(save.getPath())) {
                try {
                    ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
                    information = (Information) (objectInputStream.readObject());
                    objectInputStream.close();
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
        return information;
    }
}