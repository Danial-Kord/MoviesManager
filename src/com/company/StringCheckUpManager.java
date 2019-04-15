package com.company;

import java.util.ArrayList;

public class StringCheckUpManager {
    private static String buildFirstString(String sorce)throws IndexOutOfBoundsException , NumberFormatException{
        sorce = sorce.substring(sorce.indexOf("</a></div></li></ul><div class=\"search-container\">"),
                sorce.indexOf("</i></div></footer></article></section></div><footer class=\"footer\"><div class=\"container\"><div class=\"buttons\">"));
        return sorce;
    }
    public static String buildTarget(String sorce){
        if(sorce.contains("نتیجه ای یافت نشد"))
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
        return sorce.substring(sorce.lastIndexOf("خلاصه داستان"),sorce.indexOf("</p></div></div><div class=\"post-info\">"))
                .replace("</h6><p>","").replace("&hellip;","...");
    }
    public static String getIMDBscore(String sorce)throws IndexOutOfBoundsException{
        String IMDBtextFinding = "<span><i class=\"fa fa-star\"></i>";
        int lastIMDBratingStringIndex = sorce.lastIndexOf(IMDBtextFinding);
        lastIMDBratingStringIndex += IMDBtextFinding.length();
        return sorce.substring(lastIMDBratingStringIndex ,lastIMDBratingStringIndex+4);
    }
    public static String getMoreDetails(String sorce)throws IndexOutOfBoundsException{
        String key = "</select></div></aside><article class=\"post\"><div class=\"figure\">";
        return sorce.substring(sorce.indexOf(key),sorce.indexOf("#p")).replace(key,"").replace("<a href=\"","");
    }
    public static String getGenre(String sorce)throws IndexOutOfBoundsException{
        String out = "ژانر : ";
        if(sorce.contains("هیجان انگیز"))
            out += "هیجان انگیز ";
        if(sorce.contains("درام"))
            out += "درام ";
        if(sorce.contains("ترسناک"))
            out += "ترسناک ";
        if(sorce.contains("کمدی"))
            out += "کمدی ";
        if(sorce.contains("اکشن"))
            out += "اکشن ";
        if(sorce.contains("عاشقانه"))
            out += "عاشقانه ";
        if(sorce.contains("جنایی"))
            out += "جنایی ";
        if(sorce.contains("ماجراجویی"))
            out += "ماجراحویی ";
        //TODO
        if(sorce.contains("ماجراجویی"))
            out += "ماجراحویی ";
        if(sorce.contains("ماجراجویی"))
            out += "ماجراحویی ";
        if(sorce.contains("ماجراجویی"))
            out += "ماجراحویی ";
        return out.substring(0,out.length()-1);
    }
    public static String getImageUrl(String sorce) throws IndexOutOfBoundsException {
        sorce = sorce.substring(sorce.lastIndexOf("img src=\"")+9,sorce.length());
        return  sorce.substring(0,sorce.indexOf("\" alt"));
    }
    public static String IMDB_best_ever(String sorce)throws IndexOutOfBoundsException{
        String key = "imdb-top-rated-old-style\">";
        if(sorce.contains(key)){
            return sorce.substring(sorce.indexOf(key) + key.length(),sorce.indexOf("IMDb</div>")).replace("</div>","");
        }
        return null;
    }
    public static String moreDetaildSummery(String sorce)throws IndexOutOfBoundsException{
        String key = "class=\"tab-pane fade in active\" id=\"tab_fa\"><p>";
        return sorce.substring(sorce.indexOf(key),sorce.indexOf("</p></div><div role=\"tabpanel\" class=\"tab-pane fade\"")).replace(key,"").
                replace("</p></div><div role=\"tabpanel\" class=\"tab-pane fade\"","");
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
