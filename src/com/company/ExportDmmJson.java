package com.company;

import java.io.*;
import java.util.ArrayList;

/**
 * One-time export: reads MovieManager.DMM and writes a JSON file for the web stack import.
 * Run from the project: compile then
 * <pre>java -cp out/production/MoviesManager com.company.ExportDmmJson C:/path/out.json</pre>
 */
public class ExportDmmJson {

    public static void main(String[] args) throws Exception {
        String outPath = args.length > 0 ? args[0] : "library-export.json";
        Information information = readDmm();
        if (information == null) {
            System.err.println("No MovieManager.DMM found in user home or project path.");
            System.exit(1);
            return;
        }
        try (PrintWriter w = new PrintWriter(new OutputStreamWriter(new FileOutputStream(outPath), "UTF-8"))) {
            w.print("{\"paths\":[");
            boolean fp = true;
            for (String p : information.getPaths()) {
                if (!fp) w.print(',');
                fp = false;
                w.print(escapeJson(p == null ? "" : p, true));
            }
            w.print("],\"movies\":[");
            boolean fm = true;
            for (Movie m : information.getMovies()) {
                if (!fm) w.print(',');
                fm = false;
                w.print(movieToJson(m));
            }
            w.print("]}");
        }
        System.out.println("Wrote " + new File(outPath).getAbsolutePath());
    }

    private static Information readDmm() {
        Information information = new Information();
        File save = null;
        File save2 = new File(Information.path2 + "\\" + "MovieManager.DMM");
        File save1 = new File(Information.path + "\\" + "MovieManager.DMM");
        if (save2.exists()) {
            save = save1;
        } else if (save1.exists()) {
            save = save2;
        }
        if (save == null || !save.exists()) {
            return null;
        }
        try (FileInputStream fileInputStream = new FileInputStream(save.getPath());
             ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream)) {
            information = (Information) objectInputStream.readObject();
            information.setMovies((ArrayList<Movie>) information.getMovies().clone());
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
        return information;
    }

    private static String movieToJson(Movie m) {
        StringBuilder b = new StringBuilder();
        b.append('{');
        b.append("\"name\":").append(escapeJson(m.getName(), true)).append(',');
        b.append("\"year\":").append(escapeJson(m.getYear(), true)).append(',');
        b.append("\"path\":").append(escapeJson(m.getPath(), true)).append(',');
        b.append("\"filePath\":").append(escapeJson(m.getPath(), true)).append(',');
        b.append("\"folderPath\":").append(escapeJson(m.getFolderPath(), true)).append(',');
        b.append("\"IMDBscore\":").append(escapeJson(m.getIMDBscore(), true)).append(',');
        b.append("\"IMDBrating\":").append(escapeJson(m.getIMDBrating(), true)).append(',');
        b.append("\"fullSummery\":").append(escapeJson(m.getFullSummery(), true)).append(',');
        b.append("\"summery\":").append(escapeJson(m.getSummery(), true)).append(',');
        b.append("\"actors\":").append(escapeJson(m.getActors(), true)).append(',');
        b.append("\"directors\":").append(escapeJson(m.getDirectors(), true)).append(',');
        b.append("\"genre\":").append(escapeJson(m.getGenre(), true)).append(',');
        b.append("\"imagePath\":").append(escapeJson(m.getImagePath(), true)).append(',');
        b.append("\"duration\":").append(escapeJson(m.getDuration(), true)).append(',');
        b.append("\"numberOfVotes\":").append(escapeJson(m.getNumberOfVotes(), true)).append(',');
        b.append("\"show\":").append(m.isShow()).append(',');
        b.append("\"favoriteMovie\":").append(m.isFavoriteMovie()).append(',');
        b.append("\"isUpdatedFromNet\":").append(m.isUpdatedFromNet()).append(',');
        b.append("\"isUpdated2\":").append(m.isUpdated2());
        b.append('}');
        return b.toString();
    }

    private static String escapeJson(String s, boolean asString) {
        if (s == null) s = "";
        StringBuilder b = new StringBuilder();
        if (asString) b.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':
                case '\\':
                    b.append('\\');
                    b.append(c);
                    break;
                case '\n':
                    b.append("\\n");
                    break;
                case '\r':
                    b.append("\\r");
                    break;
                case '\t':
                    b.append("\\t");
                    break;
                default:
                    if (c < 0x20) {
                        b.append(String.format("\\u%04x", (int) c));
                    } else {
                        b.append(c);
                    }
            }
        }
        if (asString) b.append('"');
        return b.toString();
    }
}
