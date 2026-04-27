package com.company.metadata;

import com.company.Movie;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

/**
 * Downloads a poster image into the library folder and updates {@link Movie#setImagePath}.
 */
public final class PosterDownloader {
    private PosterDownloader() {
    }

    public static void savePosterFromUrl(String urlString, Movie movie) {
        if (urlString == null || urlString.isEmpty()) {
            return;
        }
        System.out.println("writing image");
        String name = movie.getName();
        if (name == null) {
            name = "unknown";
        }
        File file = new File(movie.getFolderPath() + "\\" + name + "image" + ".jpg");
        String path = movie.getFolderPath() + "\\" + name + "image" + ".jpg";

        if (file.exists()) {
            try {
                Files.move(
                        file.toPath(),
                        new File((new java.io.File(".").getCanonicalPath()) + "\\images" + "\\" + name + "image" + ".jpg").toPath(),
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                e.printStackTrace();
            }
            movie.setImagePath(path);
            movie.setUpdatetFromNet(true);
            return;
        } else {
            File file1;
            try {
                file1 = new File((new File(".").getCanonicalPath()) + "\\images" + "\\" + name + "image" + ".jpg");
            } catch (IOException e) {
                e.printStackTrace();
                return;
            }
            if (file1.exists()) {
                return;
            }
        }
        System.out.println(path);

        java.lang.System.setProperty("https.protocols", "TLSv1,TLSv1.1,TLSv1.2");
        HttpURLConnection httpCon;
        try {
            URL url = new URL(urlString);
            httpCon = (HttpURLConnection) url.openConnection();
            httpCon.addRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return;
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        try (InputStream in = new BufferedInputStream(httpCon.getInputStream());
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[1024];
            int n;
            while ((n = in.read(buf)) != -1) {
                out.write(buf, 0, n);
            }
            byte[] response = out.toByteArray();
            try (FileOutputStream fos = new FileOutputStream(path)) {
                fos.write(response);
            }
            Files.copy(
                    file.toPath(),
                    new File((new java.io.File(".").getCanonicalPath()) + "\\images" + "\\" + name + "image" + ".jpg").toPath(),
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (FileNotFoundException e) {
            System.out.println(urlString);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            httpCon.disconnect();
        }
        movie.setImagePath(path);
        movie.setUpdatetFromNet(true);
    }
}
