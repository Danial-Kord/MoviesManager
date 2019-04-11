package com.company;

public class StringCheckUpManager {
    private static String buildFirstString(String sorce){
        sorce = sorce.substring(sorce.indexOf("</a></div></li></ul><div class=\"search-container\">"),
                sorce.indexOf("</i></div></footer></article></section></div><footer class=\"footer\"><div class=\"container\"><div class=\"buttons\">"));
        return sorce;
    }
    public static String buildTarget(String sorce){
        sorce = buildFirstString(sorce);
        int numberOfSearchResults = numberOfSearchAnswers(sorce);
        if(numberOfSearchResults >= 1){
            if(numberOfSearchResults == 1)
            return sorce;
        }
        return null;
    }
    private static int numberOfSearchAnswers(String sorce){
        return Integer.parseInt(sorce.substring(0,sorce.indexOf("نتیجه یافت شد")).substring(sorce.indexOf("<bdi>")+5,sorce.lastIndexOf("</bdi>")));
    }
    public static String getSummery(String sorce){
        return sorce.substring(sorce.lastIndexOf("خلاصه داستان"),sorce.indexOf("</p></div></div><div class=\"post-info\">"))
                .replace("</h6><p>","").replace("&hellip;","...");
    }
    public static String getIMDBscore(String sorce){
        String IMDBtextFinding = "<span><i class=\"fa fa-star\"></i>";
        int lastIMDBratingStringIndex = sorce.lastIndexOf(IMDBtextFinding);
        lastIMDBratingStringIndex += IMDBtextFinding.length();
        return sorce.substring(lastIMDBratingStringIndex ,lastIMDBratingStringIndex+4);
    }
    public static String getGenre(String sorce){
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

        return out.substring(0,out.length()-1);
    }
    public static String getImageUrl(String sorce){
        sorce = sorce.substring(sorce.indexOf("img src=\"")+9,sorce.length());
        return  sorce.substring(0,sorce.indexOf("\" alt"));
    }
}
