package dataBase;


import UI.AttentionPane;

import java.sql.*;


public class DBConnection {
    public static Statement statement;
    public static Connection connection;
    public static void connect(){

        try {
            System.out.println("trying to coonect");
            Class.forName("com.mysql.jdbc.Driver");
            String serverName = "localhost:3306";
            String mydatabase = "sitadu_DataBase";
            String url = "jdbc:mysql://" + serverName + "/" + mydatabase;
            connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/DanialMovieManager","root","Dkm45477781");
            statement = connection.createStatement();

        }
        catch (SQLException e) {
            System.out.println("couldn't build statement object");
            e.printStackTrace();
            AttentionPane.Error(e.getLocalizedMessage());

        }
        catch (ClassNotFoundException e) {
            e.printStackTrace();
            AttentionPane.Error(e.getLocalizedMessage());

        }

    }
    public static int myExcuteUpdate(String request){
        try {
            return statement.executeUpdate(request);
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("problem  on calling excute update with sent request! : "+request);
            AttentionPane.Error(e.getLocalizedMessage());

        }
        return -1;
    }
    public static ResultSet myExcuteQuery(String request){
        try {
            return statement.executeQuery(request);
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("problem  on calling excute query with sent request! : "+request);
            AttentionPane.Error(e.getLocalizedMessage());

        }
        return null;
    }

}
