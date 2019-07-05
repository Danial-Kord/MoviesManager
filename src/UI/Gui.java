package UI;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.Label;
import javafx.scene.control.Menu;
import javafx.scene.control.MenuBar;
import javafx.scene.control.MenuItem;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;


import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class Gui extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        BorderPane root = new BorderPane();
//        try {
//            root = FXMLLoader.load(getClass().getResource("danial.fxml"));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        primaryStage.setTitle("Hello World");

        primaryStage.setScene(new Scene(root, 1200, 600));

        //menu
        MenuBar menubar = new MenuBar();
        Menu FileMenu = new Menu("File");
        MenuItem filemenu1=new MenuItem("new");
        MenuItem filemenu2=new MenuItem("Save");
        MenuItem filemenu3=new MenuItem("Exit");
        Menu EditMenu=new Menu("Edit");
        MenuItem EditMenu1=new MenuItem("Cut");
        MenuItem EditMenu2=new MenuItem("Copy");
        MenuItem EditMenu3=new MenuItem("Paste");
        EditMenu.getItems().addAll(EditMenu1,EditMenu2,EditMenu3);
        FileMenu.getItems().addAll(filemenu1,filemenu2,filemenu3);
        menubar.getMenus().addAll(FileMenu,EditMenu);
        //set menu position
        BorderPane top = new BorderPane();
        top.setTop(menubar);

        //image logo
        FileInputStream input= null;
        try {
            input = new FileInputStream("D:\\Danial\\Projects\\InteliJ Idea\\MoviesManager\\src\\pics\\danialArts.png");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Image image = new Image(input);
        ImageView imageview=new ImageView(image);
        imageview.setFitWidth(300);
        imageview.setFitHeight(200);
        Label my_label=new Label("",imageview);
        my_label.setId("logo");
        top.setId("top");
        top.setRight(my_label);


        root.setTop(top);

        primaryStage.show();
        root.getStylesheets().add("UI/Danial.css");
    }
}
