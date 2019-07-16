package com.company;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;

public class DirCleaner {
    //    public static String buildNewFolder(String path){
//        Random random = new Random();
//        int a = random.nextInt(2000);
//        return buildNewFolder(path,"Dan20");
//    }
    public static String buildNewFolder(String path){
        File folder = new File(path);
        if(folder.isDirectory())
        {
            ArrayList<File>fileList = new ArrayList<File>();
            fileList = getMovies(folder,fileList);

            System.out.println("\nTotal number of items present in the directory: " + fileList.size() );

            File dir = new File(path);
//            dir.mkdir();
            // Lists only files since we have applied file filter
            for(File file:fileList)
            {
                if(file.getName().endsWith(".mkv") || file.getName().endsWith(".mp4") || file.getName().endsWith(".mpeg") ||
                        file.getName().endsWith(".mpeg2") || file.getName().endsWith(".avi") || file.getName().endsWith(".srt") || file.getName().endsWith(".ass")) {
                    if(!(dir.getAbsolutePath() + "\\" + file.getName()).equals(file.getAbsolutePath())) {
                        File destination = new File(dir.getAbsolutePath() + "\\" + file.getName());
                        if (file.renameTo(destination)) {
                            file.delete();
                        }
                    }
                }
            }
        }
        //sorting subtitles
        deletDirs(folder);
        return path;
    }

    public static ArrayList<File> getMovies(File dad,ArrayList<File>files){
        File[] fileList = dad.listFiles();
        if(fileList == null)
            return files;
        for (File temp : fileList){
            if(temp.isDirectory()){
                files = getMovies(temp,files);
            }
            else {
                files.add(temp);
            }
        }
        return files;
    }
    private static void deletDirs(File folder){
        if(folder.isDirectory()) {
            File[] files = folder.listFiles();
            for (File file : files) {
                if (file.isDirectory()) {
                    if (file.delete()){}
                    else{
                        deletDirs(file);
                    }
                    file.delete();
                }
            }
        }
    }
}

