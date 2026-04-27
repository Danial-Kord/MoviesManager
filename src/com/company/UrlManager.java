package com.company;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.*;

public class UrlManager
{
    public static String getURLSource(String url1) throws IOException, UnknownHostException
    {

        try {
            java.lang.System.setProperty("https.protocols", "TLSv1,TLSv1.1,TLSv1.2");
            URL url = new URL(url1);
            HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
//        httpCon.addRequestProperty("Host", "www.cumhuriyet.com.tr");
//        httpCon.addRequestProperty("DBCoonection", "keep-alive");
//        httpCon.addRequestProperty("Cache-Control", "max-age=0");
//        httpCon.addRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
            httpCon.addRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36");
//        httpCon.addRequestProperty("Accept-Encoding", "gzip,deflate,sdch");
//        httpCon.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
//        httpCon.setInstanceFollowRedirects(false);
//        httpCon.setDoOutput(true);
//        httpCon.setUseCaches(true);
//        httpCon.setRequestMethod("GET");
            httpCon.setConnectTimeout(500000);
            httpCon.setReadTimeout(500000);
//        httpCon.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11");
            String out = toString(httpCon.getInputStream());
            httpCon.disconnect();
            return out;

        }
        catch (NoRouteToHostException | UnknownHostException e){
            System.out.println("offline");
        }
        return null;
//        BufferedReader in = new BufferedReader(new InputStreamReader(httpCon.getInputStream(), "UTF-8"));
//        String inputLine;
//        StringBuilder a = new StringBuilder();
//        while ((inputLine = in.readLine()) != null)
//            a.append(inputLine);
//        in.close();
//
//        httpCon.disconnect();
//        return a.toString();


    }

    /**
     * HTTP GET for JSON API responses (TMDb, OMDb, etc.).
     */
    public static String getUrlJson(String url1) throws IOException, UnknownHostException {
        try {
            java.lang.System.setProperty("https.protocols", "TLSv1,TLSv1.1,TLSv1.2");
            URL url = new URL(url1);
            HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
            httpCon.addRequestProperty("Accept", "application/json");
            httpCon.addRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            httpCon.setConnectTimeout(60_000);
            httpCon.setReadTimeout(120_000);
            int code = httpCon.getResponseCode();
            InputStream in = code < 400 ? httpCon.getInputStream() : httpCon.getErrorStream();
            if (in == null) {
                httpCon.disconnect();
                return null;
            }
            String out = toString(in);
            in.close();
            httpCon.disconnect();
            return out;
        } catch (NoRouteToHostException | UnknownHostException e) {
            System.out.println("offline");
            throw e;
        }
    }

    private static String toString(InputStream inputStream) throws IOException
    {
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8")))
        {
            String inputLine;
            StringBuilder stringBuilder = new StringBuilder();
            while ((inputLine = bufferedReader.readLine()) != null)
            {
                stringBuilder.append(inputLine);
            }

            return stringBuilder.toString();
        }
    }
}