package com.company;

import java.util.ArrayList;

public class StringCheckUpManager {
    private static String buildFirstString(String sorce)throws IndexOutOfBoundsException , NumberFormatException{

        sorce = sorce.  substring(sorce.indexOf("<!-- Search -->"),
                sorce.lastIndexOf("<!-- //Search -->"));
        return sorce;
    }
    public static String buildTarget(String sorce){
        if(sorce.contains("نتیجه ای یافت نشد") || !sorce.contains("نتیجه یافت شد"))
            return null;
        sorce = buildFirstString(sorce);
        int numberOfSearchResults = numberOfSearchAnswers(sorce);
        if(numberOfSearchResults >= 1){
            if(numberOfSearchResults == 1)
            return sorce;
        }
        return null;
    }
    private static int numberOfSearchAnswers(String sorce)throws IndexOutOfBoundsException , NumberFormatException{
        return Integer.parseInt(sorce.substring(0,sorce.indexOf("نتیجه یافت شد")).substring(sorce.indexOf("<bdi>")+5,sorce.lastIndexOf("</bdi>")));
    }
    public static String getSummery(String sorce)throws IndexOutOfBoundsException{
        return sorce.substring(sorce.indexOf("خلاصه داستان"),sorce.substring(sorce.indexOf("خلاصه داستان"))
                .indexOf("</p>")+sorce.indexOf("خلاصه داستان"))
                .replace("خلاصه داستان:","").replace("</h6>","").replace("<p>","").replace("&hellip;","...");



    }
    public static String getIMDBscore(String sorce)throws IndexOutOfBoundsException{

        return sorce.substring(sorce.indexOf("<span><i class=\"fa fa-star\"></i>") ,sorce.indexOf("<span><i class=\"fa fa-star\"></i>") +sorce.substring(sorce.indexOf("<span><i class=\"fa fa-star\"></i>")).indexOf("</span>"))
                .replace("<span><i class=\"fa fa-star\"></i>","");
    }
    public static String getMoreDetails(String sorce)throws IndexOutOfBoundsException{
        String temp =  sorce.substring(0,sorce.indexOf("\" class=\"post-more\">"));
        temp = temp.substring(temp.lastIndexOf("<a href=\""));
        return temp.replace("<a href=\"","").replace("#p","");
    }
    public static String getGenre(String sorce)throws IndexOutOfBoundsException{
        String out = ",";
        if(sorce.contains("هیجان انگیز"))
            out += "Exciting,";
        if(sorce.contains("درام"))
            out += "Drama,";
        if(sorce.contains("ترسناک"))
            out += "Horror,";
        if(sorce.contains("کمدی"))
            out += "Comedy,";
        if(sorce.contains("اکشن"))
            out += "Action,";
        if(sorce.contains("عاشقانه"))
            out += "Romance,";
        if(sorce.contains("جنایی"))
            out += "Criminal,";
        if(sorce.contains("ماجراجویی"))
            out += "Adventure,";

        //TODO
//        if(sorce.contains("ماجراجویی"))
//            out += "ماجراحویی ";
//        if(sorce.contains("ماجراجویی"))
//            out += "ماجراحویی ";
//        if(sorce.contains("ماجراجویی"))
//            out += "ماجراحویی ";
        return out;
    }
    public static String getImageUrl(String sorce) throws IndexOutOfBoundsException {
        sorce = sorce.substring(sorce.lastIndexOf("img src=\"")+9,sorce.length());
        return  sorce.substring(0,sorce.indexOf("\" alt"));
    }
    public static String IMDB_best_ever(String sorce)throws IndexOutOfBoundsException{
        return sorce.substring(sorce.indexOf("<div class=\"imdb-top-rated-old-style\">") ,sorce.indexOf("<div class=\"imdb-top-rated-old-style\">") +sorce.substring(sorce.indexOf("<div class=\"imdb-top-rated-old-style\">")).indexOf("</div> "))
                .replace("<div class=\"imdb-top-rated-old-style\">","");
    }
    public static String moreDetaildSummery(String sorce)throws IndexOutOfBoundsException{
        System.out.println(sorce);
        return sorce.substring(sorce.indexOf("<!-- Post -->"),sorce.indexOf("<div class=\"clearfix\"></div>"));
   }
    public static String findingActors (String sorce)throws IndexOutOfBoundsException{
        sorce = (sorce.substring(sorce.indexOf("<a href=\"/search?cast"),sorce.length()-1));
        sorce = sorce.substring(0,sorce.indexOf("</bdi></div><div class=\"info\">"));
        sorce = sorce.replace("</bdi></div><div class=\"info\">","");
        String key = "<a href=\"/search?cast=";
        while (sorce.contains(key)){
            String key2 = sorce.substring(sorce.indexOf(key),(sorce.indexOf(key)+key.length()) + 9);//some thing that starts with key and countinous with key2 is repeted that should be delet
            sorce = sorce.replace(key2," ");
        }
        while (sorce.contains("target=\"_blank\">")){
            sorce = sorce.replace("target=\"_blank\">","");
        }
        while (sorce.contains("</a>")){
            sorce = sorce.replace("</a>","");
        }
        return sorce.replace("\"","");
    }
}
