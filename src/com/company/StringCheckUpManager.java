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
            if(numberOfSearchResults <= 70){
                sorce = sorce.substring(sorce.indexOf("<article class=\"post\">"),sorce.indexOf("</article>"));
                return sorce;
            }
        }
        return null;
    }
    private static int numberOfSearchAnswers(String sorce)throws IndexOutOfBoundsException , NumberFormatException{
        return Integer.parseInt(sorce.substring(0,sorce.indexOf("نتیجه یافت شد")).substring(sorce.indexOf("<bdi>")+5,sorce.lastIndexOf("</bdi>")));
    }
    public static String getSummery(String sorce)throws IndexOutOfBoundsException{
        String out = sorce.substring(sorce.indexOf("خلاصه داستان"),sorce.substring(sorce.indexOf("خلاصه داستان"))
                .indexOf("</p>")+sorce.indexOf("خلاصه داستان"))
                .replace("خلاصه داستان:","").replace("</h6>","").replace("<p>","").replaceAll("&hellip;","...")
                .replaceAll("&quot","\"");
        while (out.startsWith(" ")){
            out = out.substring(1);
        }
        return out;


    }
    public static String getNewSite(String sorce){
        String out = sorce.substring(sorce.indexOf("https://30nama"));
        out = out.substring(0,out.indexOf("\""));
        System.out.println("wtf");
        System.out.println(out);
        return out;
    }
    public static String getIMDBscore(String sorce)throws IndexOutOfBoundsException{

        return sorce.substring(sorce.indexOf("<span><i class=\"fa fa-star\"></i>") ,sorce.indexOf("<span><i class=\"fa fa-star\"></i>") +sorce.substring(sorce.indexOf("<span><i class=\"fa fa-star\"></i>")).indexOf("</span>"))
                .replace("<span><i class=\"fa fa-star\"></i>","");
    }
    public static String getMoreDetails(String sorce)throws IndexOutOfBoundsException{
        System.out.println(".....\n"+sorce.length());
        String temp =  sorce.substring(0,sorce.indexOf("\" class=\"post-more\">"));
        temp = temp.substring(temp.lastIndexOf("<a href=\""));
        temp = temp.replace("<a href=\"","").replace("#p","");
        temp = temp.substring(temp.indexOf("30nama"));
        temp = temp.replaceFirst(temp.substring(0,temp.indexOf("/")-1),Information.siteURL);
        System.out.println("\n"+temp.length()+"......<<<<<<\n");
        return temp;
    }
    public static String getDirectors(String sorce){
        try {
            String in = sorce.substring(sorce.indexOf("کارگردان"));

            in = in.substring(0, in.indexOf("</div>"));

            String out = "";
            String[] regex = in.split(",");
            for (int i = 0; i < regex.length; i++) {
                out += regex[i].substring(regex[i].indexOf("blank\">"), regex[i].indexOf("</a>")).replaceFirst("blank\">", "") + ",";

            }
            System.out.println(out);


            return out;
        }
        catch (IndexOutOfBoundsException e){
            System.out.println(sorce);
        }
        return null;
    }
    public static String getNumberOfVotes(String sorce){
        String in = sorce.substring(sorce.indexOf("امتیاز IMDb"));
        in = in.substring(in.indexOf("اساس"));
        return in.substring(in.indexOf("<em>"),in.indexOf("</em>")).replaceFirst("<em>","");
    }
    public static String getGenre(String sorce)throws IndexOutOfBoundsException{



        String out = "";

        try {
            if (!sorce.contains("class=\"genre\" target=\"_blank\">")) {
                System.out.println(sorce);
            }
        }
        catch (NullPointerException e){
            System.out.println(sorce);
        }
        String [] generes = sorce.split("class=\"genre\" target=\"_blank\">");
        for (int i=1;i<generes.length;i++){
            out+=generes[i].substring(0,generes[i].indexOf("</a>")).replace("</a>","")+",";
        }
        if (true)
            return out;
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


        if(sorce.contains("علمی-تخیلی"))
            out += "Science-Fiction,";
        if(sorce.contains("معمایی"))
            out += "Mystery,";
        if(sorce.contains("فانتزی"))
            out += "Fantasy,";

        if(sorce.contains("خانوادگی"))
            out += "Family,";
        if(sorce.contains("مستند"))
            out += "Documentary,";
        if(sorce.contains("انیمیشن"))
            out += "Animation,";
        if(sorce.contains("زندگینامه"))
            out += "Biography,";
        if(sorce.contains("موزیکال"))
            out += "Musical,";
        if(sorce.contains("جنگی"))
            out += "War,";
        if(sorce.contains("تاریخی"))
            out += "History,";
        if(sorce.contains("کوتاه"))
            out += "Short,";
        if(sorce.contains("وسترن"))
            out += "Western,";
        if(sorce.contains("نوآر"))
            out += "Noir";
        if(sorce.contains("ورزشی"))
            out += "Sport";
        if(sorce.contains("برنامه تلویزیونی"))
            out += "Reality-Tv";
        if(sorce.contains("استند آپ کمدی"))
            out += "Stand-Up-Comedy";
        if(sorce.contains("مسابقه تلویزیونی"))
            out += "Game-Show";
        if(sorce.contains("تاک شو"))
            out += "Talk-Show";
        if(sorce.contains("سیتکام"))
            out += "Sitcom";
        if(sorce.contains("فراطبیعی"))
            out += "Supernatural";
        if(sorce.contains("ابر قهرمانی"))
            out += "Superhero";
        if(sorce.contains("لایو اکشن"))
            out += "Live-Action";
        if(sorce.contains("تئاتر"))
            out += "Theatre";

        return out;
    }
    public static String getSummeryEn (String sorce)throws IndexOutOfBoundsException{
//        tab_en
        System.out.println(sorce.substring(sorce.length()-5));
        String in = sorce.substring(0);
         in = in.substring(in.lastIndexOf("خلاصه داستان"));
        in = in.substring(in.lastIndexOf("id=\"tab_en\"><p>")).replace("id=\"tab_en\"><p>","");

        return in.substring(0,in.indexOf("</p>")).replace("&#039;","");
    }
    public static String getImageUrl(String sorce) throws IndexOutOfBoundsException {
        String sorce1 =
//                "view-source:"+
                        sorce.substring(sorce.lastIndexOf("img src=\"")).replace("img src=\"","");
        sorce1 = sorce1.substring(0,sorce1.lastIndexOf(".jpg"))+".jpg";
//        sorce1.replace(" ","_");
//        sorce1 = sorce1.substring(0,sorce1.lastIndexOf("\" alt=\""));
        return  sorce1;
    }
    public static String IMDB_best_ever(String sorce)throws IndexOutOfBoundsException{
        return sorce.substring(sorce.indexOf("<div class=\"imdb-top-rated-old-style\">") ,sorce.indexOf("<div class=\"imdb-top-rated-old-style\">") +sorce.substring(sorce.indexOf("<div class=\"imdb-top-rated-old-style\">")).indexOf("</div> "))
                .replace("<div class=\"imdb-top-rated-old-style\">","");
    }
    public static String moreDetaildSummery(String sorce){
//        System.out.println(sorce);
        if(sorce.contains("�"))
            return "";
        System.out.println(sorce);
        try {
            String temp = sorce.substring(sorce.indexOf("<!-- Post -->"), sorce.indexOf("<script>"));
            return temp;
        }
        catch (IndexOutOfBoundsException e){
            return sorce;
        }
   }
    public static String findingActors (String sorce1)throws IndexOutOfBoundsException{
        String sorce="";
        sorce = (sorce1.substring(sorce1.indexOf("بازیگران اصلی")));
        sorce = sorce.substring(0,sorce.indexOf("</bdi>"));
        sorce = sorce.replace("<bdi>","");
        sorce = sorce.replace("بازیگران اصلی","");
        sorce = sorce.replace("</span> ","");

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
        sorce = sorce.substring(sorce.indexOf("\""));

        System.out.println(sorce);
        return sorce.replace("\"","");
    }
    public static String getHours(String sorce)throws IndexOutOfBoundsException{
        String sorce1 = sorce.substring(sorce.indexOf("مدت زمان"));
        return sorce1.substring(sorce1.indexOf("</span> "),sorce1.indexOf("</div>")).replace("</span>","")
                .replace("ساعت","h").replace("دقیقه","m").replaceAll(" ","")
                .replace("و"," & ");
    }
}
