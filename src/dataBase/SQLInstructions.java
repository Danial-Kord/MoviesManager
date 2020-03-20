
package dataBase;

import UI.AttentionPane;

import java.sql.SQLException;
import java.sql.Statement;

public class SQLInstructions {

    public static boolean remove(String table,String cond){
        String sql = SQLStatement.delete(table,cond);
        Statement statement = DBConnection.statement;

        try {

            statement.executeUpdate(sql);
            System.out.println("Record deleted successfully");
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            AttentionPane.Error(e.getLocalizedMessage());
        }
       return false;
    }
    public static boolean update(String table,String values,String cond){

        String sql = SQLStatement.update(table,values,cond);
        System.out.println(sql);
        Statement statement = DBConnection.statement;
        try {
            statement.executeUpdate(sql);
            System.out.println("Record updated successfully");
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            AttentionPane.Error(e.getLocalizedMessage());
        }
        return false;
    }
        public static boolean drop(){
        String sql = SQLStatement.dropTable("raw_material");
            System.out.println(sql);
            Statement statement = DBConnection.statement;
            try {
                statement.executeUpdate(sql);
                System.out.println("Record deleted successfully");
                return true;
            } catch (SQLException e) {
                e.printStackTrace();
                AttentionPane.Error(e.getLocalizedMessage());
            }
            return false;
        }


    public static boolean creatTableRawMaterial(){
        String sql = "create table raw_material " +
                "(id int auto_increment, " +
                "name    varchar(30), " +
                "price   int, " +
                "market_id varchar(40), " +
                "primary key (id), " +
                "foreign key (market_id) references market(id))";
        System.out.println(sql);
        Statement statement = DBConnection.statement;
        try {
            statement.executeUpdate(sql);
            System.out.println("Record created successfully");
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            AttentionPane.Error(e.getLocalizedMessage());
        }
        return false;
    }
}
