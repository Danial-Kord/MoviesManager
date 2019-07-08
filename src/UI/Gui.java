package UI;

import com.company.Movie;
import javafx.application.Application;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Orientation;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.media.MediaView;
import javafx.stage.Stage;
import javafx.scene.control.ScrollBar;


import java.io.IOException;
import java.util.ArrayList;

public class Gui extends Application {
    MenuBar menuBar;
    ToolBar serach;
    ToolBar findFavorite;
    TabPane tabPane;
    StackPane mainPane;
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
        root.getStylesheets().add("UI/Danial.css");
        SplitPane splitPane = (SplitPane)root.getChildren().get(0);
        AnchorPane anchorPane = (AnchorPane)splitPane.getItems().get(0);
        menuBar = (MenuBar)anchorPane.getChildren().get(0);
        serach = (ToolBar)anchorPane.getChildren().get(2);
        findFavorite = (ToolBar)anchorPane.getChildren().get(3);
        tabPane = (TabPane) root.getChildren().get(1);
        Node mainNode =  tabPane.getTabs().get(0).getContent();
        mainPane = (StackPane) (mainNode);
        primaryStage.setTitle("Movie Manager");
        primaryStage.setScene(new Scene(root, 1200, 600));
        primaryStage.show();



        final FlowPane mainPane= new FlowPane();
        mainPane.setPadding(new Insets(5, 5, 5, 5));
        mainPane.setVgap(5);
        mainPane.setHgap(5);
        mainPane.setAlignment(Pos.CENTER);

        final ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Horizontal scroll bar
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Vertical scroll bar
        scroll.setContent(mainPane);
        scroll.viewportBoundsProperty().addListener(new ChangeListener<Bounds>() {
            @Override
            public void changed(ObservableValue<? extends Bounds> ov, Bounds oldBounds, Bounds bounds) {
                mainPane.setPrefWidth(bounds.getWidth());
                mainPane.setPrefHeight(bounds.getHeight());
            }
        });
        this.mainPane.getChildren().addAll(scroll);



        for (int i=0;i<10;i++) {
            Movie movie = new Movie("ali", "taghi", "dsada");
            movie.setSummery("faafasfaaaaaaaaa");
            movie.setImagePath("src\\Desert.jpg");
            MediaContent mediaContent = new MediaContent(movie);
            mainPane.getChildren().add(mediaContent.getImage());
        }






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
