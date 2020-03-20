package dataBase;

import java.sql.*;
import java.util.ArrayList;

public class SQLTypeGenerator {


    public static PreparedStatement setdata(PreparedStatement preparedStatement, ArrayList<Object>objects){
        try {
            Object object;
            for (int i = 0; i < objects.size(); i++) {
                object = objects.get(i);
                if (object == null) {
                    preparedStatement.setNull(i+1, Types.NULL);
                } else if (object instanceof String) {
                    preparedStatement.setString(i+1,(String)object);
                }
                else if (object instanceof Date){
                    preparedStatement.setDate(i+1,(Date)object);
                }
                else if (object instanceof Timestamp){
                    preparedStatement.setTimestamp(i+1,(Timestamp)object);
                }
                else if (object instanceof Time){
                    preparedStatement.setTime(i+1,(Time)object);
                }
                else if (object instanceof Float) {
                    preparedStatement.setFloat(i+1, (Float) object);
                }
                else if (object instanceof Integer) {
                    System.out.println(object);
                    preparedStatement.setInt(i+1,(Integer) object);
                }
                else if (object instanceof Boolean) {
                    preparedStatement.setBoolean(i+1,(boolean)object);
                }
                else {
                    RuntimeException runtimeException = new RuntimeException();
                    throw runtimeException;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return preparedStatement;
    }




    public static void getData(ResultSet resultSet, ArrayList<Object>objects){
        try {
            Object object;
            for (int i = 0; i < objects.size(); i++) {
                object = objects.get(i);
                 if (object instanceof String) {
                   objects.set(i,resultSet.getString(i+1));
                }
                else if (object instanceof Date) {
                    objects.set(i,resultSet.getDate(i+1));

                }
                else if (object instanceof Float) {
                    objects.set(i,resultSet.getFloat(i+1));
                }
                else if (object instanceof Integer) {
                    objects.set(i,resultSet.getInt(i+1));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

    }
}
