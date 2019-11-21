package dataBase;

import com.company.Movie;

public class InsertManager extends RequestManager{
    //private static String instruction = "insert into "+{type}+" values("+{values}+")";
    public static void insertMovie(Movie movie){
        String values = "";
        values += "('"+movie.getName()+"','"+movie.getYear()+"','"+movie.getIMDBscore()+"','"+movie.getIMDBrating()+"','"+movie.getDuration()+"','"+
                movie.getNumberOfVotes()+"','"+movie.getSummery()+"')";
        String req = "insert into movies values" + values;
        DBCoonection.myExcuteUpdate(req);
        values = "";

        String[]temp = movie.getActors().split(" ,");
        for (int i=0;i<temp.length;i++){
            values = "("+temp[i]+")";
            req = "insert into actor"+values;
            DBCoonection.myExcuteUpdate(req);
        }
        String[]temp2 = movie.getDirectors().split(" ,");//TODO check
        for (int i=0;i<temp2.length;i++){
            values = "("+temp2[i]+")";
            req = "insert into actor"+values;
            DBCoonection.myExcuteUpdate(req);
        }
    }
}
