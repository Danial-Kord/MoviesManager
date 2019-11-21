package dataBase;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DBCoonection {
    public static Statement statement;
    public static void connect(){

        try {
//            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306","root","Dkm45477781");
            statement = connection.createStatement();
        }
        catch (SQLException e) {
            System.out.println("couldn't build statement object");
            e.printStackTrace();
        }
//        catch (ClassNotFoundException e) {
//            e.printStackTrace();
//        }
    }
    public static int myExcuteUpdate(String request){
        try {
            return statement.executeUpdate(request);
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("problem  on calling excute update with sent request! : "+request);
        }
        return -1;
    }
}
