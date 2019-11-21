package dataBase;

import java.sql.SQLException;
import java.sql.Statement;

public class RequestManager {
    private static Statement statement = DBCoonection.statement;
    public static void sendRequest(String request){
        try {
            statement.executeUpdate(request);
        } catch (SQLException e) {
            System.out.println("coudn;t send request : "+request);
            e.printStackTrace();
        }
    }
}
