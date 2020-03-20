package dataBase;

import java.util.ArrayList;

public class SQLStatement {
    public static String insert(String table, String  attributs){


        String values ="?";
        for (int i=1;i<attributs.split(",").length;i++){
            values += ", ?";
        }
        return "insert into "+table+"("+attributs+")"+" values("+values+")";
    }
    public static String insert(String table, int size){
        String values ="?";
        for (int i=1;i<size;i++){
            values += ", ?";
        }
        return "insert into "+table+" values("+values+")";
    }
    public static String select(String table, String values, String cond){
        return "select " + values +" from "+table +" where "+cond;
    }
    public static String select(String table, String values, String cond, String extra){
        if(extra == null)
            return "select " + values +" from "+table +" where "+cond;
        else if(cond == null)
            return "select " + values +" from "+table + " " + extra;
        return "select " + values +" from "+table +" where "+cond + " " + extra;
    }
    public static String dropTable(String table){
        return "DROP TABLE "+table;
    }
    public static String select(String table, String values){
        return "select " + values +" from "+table ;
    }
    public static String delete(String table,String cond){
        return "delete from "+table+" where "+cond;
    }
    public static String update(String table,String values,String cond){
        return "update "+table+" set "+values + " where " + cond;
    }
}
