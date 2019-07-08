package UI;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.Pane;
import javafx.scene.media.MediaView;
import javafx.stage.Stage;



import java.io.IOException;

public class Gui extends Application {
    MenuBar menuBar;
    ToolBar serach;
    ToolBar findFavorite;
    TabPane tabPane;
    FlowPane mainPane;
    BorderPane root;
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
         root = null;
        try {
            root = FXMLLoader.load(getClass().getResource("MovieManager.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        primaryStage.setTitle("Hello World");
        primaryStage.setScene(new Scene(root, 1200, 600));

        SplitPane splitPane = (SplitPane)root.getChildren().get(0);
        AnchorPane anchorPane = (AnchorPane)splitPane.getItems().get(0);
        menuBar = (MenuBar)anchorPane.getChildren().get(0);
        serach = (ToolBar)anchorPane.getChildren().get(2);
        findFavorite = (ToolBar)anchorPane.getChildren().get(3);
        tabPane = (TabPane) root.getChildren().get(1);
        Node mainNode =  tabPane.getTabs().get(0).getContent();
        mainPane = (FlowPane)(mainNode);

        primaryStage.show();
//
//        //menu
//        MenuBar menubar = new MenuBar();
//        Menu FileMenu = new Menu("File");
//        MenuItem filemenu1=new MenuItem("new");
//        MenuItem filemenu2=new MenuItem("Save");
//        MenuItem filemenu3=new MenuItem("Exit");
//        Menu EditMenu=new Menu("Edit");
//        MenuItem EditMenu1=new MenuItem("Cut");
//        MenuItem EditMenu2=new MenuItem("Copy");
//        MenuItem EditMenu3=new MenuItem("Paste");
//        EditMenu.getItems().addAll(EditMenu1,EditMenu2,EditMenu3);
//        FileMenu.getItems().addAll(filemenu1,filemenu2,filemenu3);
//        menubar.getMenus().addAll(FileMenu,EditMenu);
//        //set menu position
//       BorderPane top = new BorderPane();
//       top.setTop(menubar);
//
//        //image logo
//        FileInputStream input= null;
//        try {
//            input = new FileInputStream("D:\\Danial\\Projects\\InteliJ Idea\\MoviesManager\\src\\pics\\danialArts.png");
//        } catch (FileNotFoundException e) {
//            e.printStackTrace();
//        }
//        Image image = new Image(input);
//        ImageView imageview=new ImageView(image);
//        imageview.setFitWidth(300);
//        imageview.setFitHeight(120);
//        Label my_label=new Label("",imageview);
//        my_label.maxHeight(imageview.getFitHeight()+5);
//        my_label.minHeight(image.getHeight()+5);
//        my_label.setId("logo");
//
//        top.setId("top");
//        top.setRight(my_label);
//
//
//        root.setTop(top);

//        root.getStylesheets().add("UI/Danial.css");
    }
}
