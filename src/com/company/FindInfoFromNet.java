package com.company;



import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;

public class FindInfoFromNet {
    public static Movie searchResults(Movie movie) {
        if (movie.getYear().equals("")) {
            return movie;
        }
        String name;
        String sorce = null;
        String moreDetails = ":)";
        name = movie.getName().replaceAll(" ", "+");
        name+="+"+movie.getYear();
        System.out.println(name);
        try {
            sorce = StringCheckUpManager.buildTarget(UrlManager.getURLSource("https://30nama.digital/?s=" + name));
            System.out.println("Dadadada");
        }
        catch (UnknownHostException e){
            System.out.println("offline");
        }
        catch (IOException e) {
            e.printStackTrace();
            System.out.println("net problem");
        }

        if (sorce != null) {
            try {
                moreDetails = UrlManager.getURLSource(StringCheckUpManager.getMoreDetails(sorce));
                if(moreDetails!=null){
                    try {

//                        moreDetails = StringCheckUpManager.getMoreDetails(moreDetails);
                        System.out.println("more details:");
                        movie.setEnSummery(StringCheckUpManager.getSummeryEn(moreDetails));
                        System.out.println("summery en finished");
                        movie.setActors(StringCheckUpManager.findingActors(moreDetails));
                        System.out.println("actors finished");
                        movie.setDirectors(StringCheckUpManager.getDirectors(moreDetails));
                        System.out.println("directors finished");
                        movie.setDuration(StringCheckUpManager.getHours(moreDetails));
                        System.out.println("time get");
                        movie.setNumberOfVotes(StringCheckUpManager.getNumberOfVotes(moreDetails));
                        System.out.println("numberOfVotes");

                    }
                    catch (IndexOutOfBoundsException | NumberFormatException e) {
                        System.out.println("site formating2 has been changed!");
                    }
                }
            }  catch (UnknownHostException e){
                System.out.println("offline");
            }
            catch (IOException e) {
                e.printStackTrace();
                System.out.println("net problem");
            }


            try {
                if (sorce != null) {
                    if(sorce!=null) {
                        movie.setSummery(StringCheckUpManager.getSummery(sorce));
                        movie.setIMDBrating(StringCheckUpManager.getIMDBscore(sorce));
                        movie.setGenre(StringCheckUpManager.getGenre(sorce));
                        System.out.println("genere get");
                        String imageUrl = StringCheckUpManager.getImageUrl(sorce);//TODO image
                        System.out.println("image url get");
                        saveImage(imageUrl,movie);
                        movie.setIMDBscore(StringCheckUpManager.IMDB_best_ever(sorce));
                        System.out.println("rating...");

                    }
                    else {
//                movie.setActors(StringCheckUpManager.findingActors(moreDetails));
//                movie.setFullSummery(StringCheckUpManager.moreDetaildSummery(moreDetails));
                    }
                } else {
                    System.out.println("no connection! or ridi ba searchet :|");
                }
            } catch (IndexOutOfBoundsException | NumberFormatException e) {
                System.out.println("site formating has been changed!");
            }
        }
        return movie;
    }
    private static void saveImage(String urlString,Movie movie){
        System.out.println("writing image");
        File file = new File(movie.getFolderPath()+"\\image.jpg");
        String path = movie.getFolderPath()+"\\image.jpg";

        if(file.exists()) {
            movie.setImagePath(path);
            movie.setUpdatetFromNet(true);
            return;
        }
        System.out.println(path);

        java.lang.System.setProperty("https.protocols", "TLSv1,TLSv1.1,TLSv1.2");
        HttpURLConnection httpCon=null;
        try {
            URL url = new URL(urlString);
             httpCon = (HttpURLConnection) url.openConnection();
            httpCon.addRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36");

        }
        catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        InputStream in = null;
        try {

            in = new BufferedInputStream(httpCon.getInputStream());
        }
        catch (FileNotFoundException e){
            System.out.println(urlString);//TODO
            return;
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        int n = 0;
        while (true)
        {
            try {
                if (!(-1!=(n=in.read(buf)))) break;
            } catch (IOException e) {
                e.printStackTrace();
            }
            out.write(buf, 0, n);
        }
        try {
            out.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        byte[] response = out.toByteArray();
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(path);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            fos.write(response);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        movie.setImagePath(path);
        movie.setUpdatetFromNet(true);
    }
}
