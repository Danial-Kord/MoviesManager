package com.company;

import dataBase.DBConnection;
import dataBase.SQLStatement;
import dataBase.SQLTypeGenerator;


import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.Date;
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

        DBConnection.connect();//TODO feature


        DBConnection.connect();
        ArrayList<Movie>movies = information.getMovies();
        /*


        String statement = SQLStatement.select("movies","*");
        PreparedStatement preparedStatement = null;
        try {
            preparedStatement = DBConnection.connection.prepareStatement(statement);
            ResultSet rs = preparedStatement.executeQuery();
            while (rs.next()){
                Movie movie = new Movie(rs.getString("name"),rs.getInt("year"),rs.getInt("IMDBScore")
                        ,rs.getFloat("IMDBRating"),rs.getTime("duration"),
                        rs.getInt("numberOfVotes"),rs.getString("summery"),rs.getString("fileLocation"),
                        rs.getString("sorce"),rs.getString("sorce2"),);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        while (true){

        }
        */
        for (int i=1;i<=movies.size();i++) {
            Movie movie = movies.get(i-1);
            String statement;
            ArrayList<Object> allDatas = new ArrayList<Object>();



            allDatas.add(i);
            allDatas.add(movie.getName());
            Integer value = -1;
            try {
                value = Integer.parseInt(movie.getYear());
            }
            catch (NumberFormatException e){
               // System.out.println(movie.getName());
            }
            allDatas.add(value);
            Integer score = -1;
            try {
                score = Integer.parseInt(movie.getIMDBscore().split(" ")[0]);
            }
            catch (NumberFormatException e){}
            allDatas.add(score);

            Float rate = -1.0f;
            try {
                rate = Float.parseFloat(movie.getIMDBrating());
            }
            catch (NumberFormatException e){}

            allDatas.add(rate);

            Time timestamp = null;
            try {
                Integer hour = 0;
                if(movie.getDuration().contains("h")){
                    hour = Integer.parseInt(movie.getDuration().substring(0,movie.getDuration().indexOf("h")).replaceAll(" ",""));
                }
                Integer min = 0;
                if(movie.getDuration().contains("m")){
                    min = Integer.parseInt(movie.getDuration().substring(movie.getDuration().indexOf("&")+1,movie.getDuration().indexOf("m")).replaceAll(" ",""));
                }
                timestamp = new Time(hour,min,0);
            }
            catch (NumberFormatException | IndexOutOfBoundsException  e){
                System.out.println("------bug---------"+movie.getName()+"++++++++++"+movie.getDuration());}

            allDatas.add(timestamp);
            Integer r = -1;
            try {
                if (!movies.get(0).getNumberOfVotes().replaceAll(",", "").equals(null) && !movies.get(0).getNumberOfVotes().replaceAll(",", "").equals("")) {
                    r = Integer.parseInt(movies.get(0).getNumberOfVotes().replaceAll(",", ""));
                }
            }
            catch (NullPointerException e){

            }
            allDatas.add(r);
            allDatas.add(movie.getSummery());
            allDatas.add(movie.getPath());
            Integer update = 1;
            if(movie.isUpdatedFromNet()) {
                update = 2;
                if(movie.isUpdated2()){
                    update = 3;
                }
            }
            allDatas.add(movie.getSorce());
            String sorce2 = null;
            try {
                if (!movie.getSorce2().contains("�") && !movie.getSorce2().equals(null)) {
                    sorce2 = movie.getSorce2();
                }
            }
            catch (Exception e){

            }
            allDatas.add(movie.getSorce2());
            allDatas.add(update);
            allDatas.add(null);
            statement = SQLStatement.insert("movies",allDatas.size());
            PreparedStatement preparedStatement = null;
            try {
                preparedStatement = DBConnection.connection.prepareStatement(statement);
            } catch (SQLException e) {
                e.printStackTrace();
            }

            SQLTypeGenerator.setdata(preparedStatement,allDatas);
            try {
                preparedStatement.execute();


                String [] generes = null;
                try {
                    if (!movie.getSorce().equals(null)) {
                        generes = StringCheckUpManager.getGenre(movie.getSorce()).split(",");
                    }
                    for (int j=0;j < generes.length;j++){
                        allDatas = new ArrayList<Object>();
                        String target = generes[j];
                        if(!target.equals("") && target!= null && target.length() !=1) {
                            while (target.startsWith(" ")) {
                                target = target.substring(1);
                            }
                            while (target.endsWith(" ")) {
                                target = target.substring(0, target.length() - 1);
                            }
                            generes[j] = target;
                        }
                        statement = SQLStatement.insert("movieGenre",2);
                        allDatas = new ArrayList<Object>();
                        allDatas.add(generes[j]);
                        allDatas.add(i);
                        SQLTypeGenerator.setdata(preparedStatement,allDatas);
                        preparedStatement.execute();
                    }

                }
                catch (NullPointerException | SQLException e){

                }


                String [] dirs = null;
                try {
                    if (!movie.getSorce2().equals(null) && !movie.getSorce2().equals("")) {
                        dirs = StringCheckUpManager.getDirectors(movie.getSorce2()).split(",");
                    }
                    for (int j=0;j < dirs.length;j++){
                        allDatas = new ArrayList<Object>();
                        String target = dirs[j];
                        if(!target.equals("") && target!= null && target.length() !=1) {
                            while (target.startsWith(" ")) {
                                target = target.substring(1);
                            }
                            while (target.endsWith(" ")) {
                                target = target.substring(0, target.length() - 1);
                            }
                            allDatas.add(target);
                            allDatas.add(i);
                            try {
                                statement = SQLStatement.insert("MovieDirector",2);
                                preparedStatement = DBConnection.connection.prepareStatement(statement);
                                SQLTypeGenerator.setdata(preparedStatement, allDatas);
                                preparedStatement.execute();
                            } catch (SQLException e) {
                                // e.printStackTrace();
                            }
                        }
                    }
                }
                catch (NullPointerException e){

                }


                String [] actors = null;
                try {
                    if (!movie.getActors().equals(null) && !movie.getActors().equals("")) {
                        actors = movie.getActors().split(",");
                    }
                    for (int j=0;j < actors.length;j++){

                        allDatas = new ArrayList<Object>();
                        String target = actors[j];
                        if(!target.equals("") && target!= null && target.length() !=1) {
                            while (target.startsWith(" ")) {
                                target = target.substring(1);
                            }
                            while (target.endsWith(" ")) {
                                target = target.substring(0, target.length() - 1);
                            }
                            allDatas.add(target);
                            allDatas.add(i);
                            try {
                                statement = SQLStatement.insert("MovieActor",2);
                                preparedStatement = DBConnection.connection.prepareStatement(statement);
                                SQLTypeGenerator.setdata(preparedStatement, allDatas);
                                preparedStatement.execute();
                            }
                            catch (NullPointerException | SQLException e){

                            }
                        }
                    }
                }
                catch (NullPointerException e){

                }


            } catch (SQLException e) {
                e.printStackTrace();
            }

            /*
            String [] generes = null;

            try {
                if (!movie.getSorce().equals(null)) {
                    generes = StringCheckUpManager.getGenre(movie.getSorce()).split(",");
                }
                for (int j=0;j < generes.length;j++){
                    statement = SQLStatement.insert("genre",1);
                    allDatas = new ArrayList<Object>();
                    String target = generes[j];
                    if(!target.equals("") && target!= null && target.length() !=1) {
                        while (target.startsWith(" ")) {
                            target = target.substring(1);
                        }
                        while (target.endsWith(" ")) {
                            target = target.substring(0, target.length() - 1);
                        }
                        allDatas.add(target);
                        try {
                            preparedStatement = DBConnection.connection.prepareStatement(statement);
                            SQLTypeGenerator.setdata(preparedStatement, allDatas);
                            preparedStatement.execute();
                        } catch (SQLException e) {
                            // e.printStackTrace();
                        }
                    }
                }
            }
            catch (NullPointerException e){

            }


            String [] dirs = null;
            try {
                if (!movie.getSorce2().equals(null) && !movie.getSorce2().equals("")) {
                    dirs = StringCheckUpManager.getDirectors(movie.getSorce2()).split(",");
                }
                for (int j=0;j < dirs.length;j++){
                    statement = SQLStatement.insert("director","name");
                    allDatas = new ArrayList<Object>();
                    String target = dirs[j];
                    if(!target.equals("") && target!= null && target.length() !=1) {
                        while (target.startsWith(" ")) {
                            target = target.substring(1);
                        }
                        while (target.endsWith(" ")) {
                            target = target.substring(0, target.length() - 1);
                        }
                        allDatas.add(target);
                        try {
                            preparedStatement = DBConnection.connection.prepareStatement(statement);
                            SQLTypeGenerator.setdata(preparedStatement, allDatas);
                            preparedStatement.execute();
                        } catch (SQLException e) {
                            // e.printStackTrace();
                        }
                    }
                }
            }
            catch (NullPointerException e){

            }


            String [] actors = null;
            try {
                if (!movie.getActors().equals(null) && !movie.getActors().equals("")) {
                    actors = movie.getActors().split(",");
                }
                for (int j=0;j < actors.length;j++){
                    statement = SQLStatement.insert("actor",1);
                    allDatas = new ArrayList<Object>();
                    String target = actors[j];
                    if(!target.equals("") && target!= null && target.length() !=1) {
                        while (target.startsWith(" ")) {
                            target = target.substring(1);
                        }
                        while (target.endsWith(" ")) {
                            target = target.substring(0, target.length() - 1);
                        }
                        allDatas.add(target);
                        try {
                            preparedStatement = DBConnection.connection.prepareStatement(statement);
                            SQLTypeGenerator.setdata(preparedStatement, allDatas);
                            preparedStatement.execute();
                        } catch (SQLException e) {
                            // e.printStackTrace();
                        }
                    }
                }
            }
            catch (NullPointerException e){

            }
            */
        }


        Scanner scanner = new Scanner(System.in);
        scanner.next();
//


//        Scanner scanner = new Scanner(System.in);
//        scanner.next();
        saveFromText(information);
        return information;
    }

}