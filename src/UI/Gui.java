package UI;

import com.company.Information;
import com.company.Movie;
import javafx.application.Application;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Orientation;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
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
    TabManager tabManager;
    private MenuButtonManager categories;
    private MenuButtonManager generes;
    private Information information;
    public static void main(String[] args) {
        launch(args);
    }

//    public Gui(Information information){
//        this.information = information;
//       // start(new Stage());
////        main();
//    }
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
        tabManager = new TabManager(tabPane);
        Node mainNode =  tabPane.getTabs().get(0).getContent();
        mainPane = (StackPane) (mainNode);
        categories = new MenuButtonManager((MenuButton)findFavorite.getItems().get(1));
        generes = new MenuButtonManager((MenuButton)findFavorite.getItems().get(2));

        setSerachHandler();
        primaryStage.setTitle("Movie Manager");
        primaryStage.setScene(new Scene(root, 1200, 600));
        primaryStage.show();



//        final FlowPane mainPane= new FlowPane();
//        mainPane.setPadding(new Insets(5, 5, 5, 5));
//        mainPane.setVgap(5);
//        mainPane.setHgap(5);
//        mainPane.setAlignment(Pos.CENTER);
//
//        final ScrollPane scroll = new ScrollPane();
//        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Horizontal scroll bar
//        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Vertical scroll bar
//        scroll.setContent(mainPane);
//        scroll.viewportBoundsProperty().addListener(new ChangeListener<Bounds>() {
//            @Override
//            public void changed(ObservableValue<? extends Bounds> ov, Bounds oldBounds, Bounds bounds) {
//                mainPane.setPrefWidth(bounds.getWidth());
//                mainPane.setPrefHeight(bounds.getHeight());
//            }
//        });
//        this.mainPane.getChildren().addAll(scroll);


        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
        for (int i=0;i<10;i++) {
            Movie movie = new Movie("ali", "taghi", "dsada");
            movie.setSummery("faafasfaaaaaaafssddddfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffaa");
            movie.setImagePath("src\\Desert.jpg");
            MediaContent mediaContent = new MediaContent(movie);
            mediaContents.add(mediaContent);
        }
        setActivePaneContent(mediaContents);





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
    public void setActivePaneContent(ArrayList<MediaContent>mediaContents){
        Tab activeTab = tabPane.getTabs().get(0);
        for (Tab tab : tabPane.getTabs()) {
            if(tab.getId().equals("activeTab")) {
                activeTab = tab;
                break;
            }
        }
        StackPane stackPane = (StackPane)activeTab.getContent();
        final FlowPane flowPane= new FlowPane();
        flowPane.setPadding(new Insets(5, 5, 5, 5));
        flowPane.setVgap(5);
        flowPane.setHgap(5);
        flowPane.setAlignment(Pos.CENTER);

        final ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Horizontal scroll bar
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Vertical scroll bar
        scroll.setContent(flowPane);
        scroll.viewportBoundsProperty().addListener(new ChangeListener<Bounds>() {
            @Override
            public void changed(ObservableValue<? extends Bounds> ov, Bounds oldBounds, Bounds bounds) {
                flowPane.setPrefWidth(bounds.getWidth());
                flowPane.setPrefHeight(bounds.getHeight());
            }
        });
        stackPane.getChildren().addAll(scroll);
        for (int i=0;i<mediaContents.size();i++){
            flowPane.getChildren().add(mediaContents.get(i).getStackPane());
//            mediaContent.getSummery().setX(mediaContent.getImage().getX());
//            mediaContent.getSummery().setY(mediaContent.getImage().getY());
//            mediaContent.getSummery().setLayoutX(mediaContent.getImage().getLayoutX());
//            mediaContent.getSummery().setLayoutY(mediaContent.getImage().getLayoutY());
        }
    }
    public void setSerachHandler(){
        TextField searchBox = (TextField) serach.getItems().get(0);
        Button ok = (Button) serach.getItems().get(1);

        EventHandler<MouseEvent>mouseEvent = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                searchForResults();
            }
        };
        EventHandler<KeyEvent>keyEventEventHandler = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                if(keyEvent.getCode().equals(KeyCode.ENTER)){
                    searchForResults();
                }
            }
        };
        searchBox.addEventHandler(KeyEvent.ANY,keyEventEventHandler);
        ok.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEvent);
    }
    public void searchForResults(){
        ArrayList<String>searchParams = new ArrayList<String>();
        TextField searchBox = (TextField) serach.getItems().get(0);
        searchParams.add(searchBox.getText());
        if(categories.getSelected()!=null)
        searchParams.add(categories.getSelected());
        if(generes.getSelected()!=null)
            searchParams.add(generes.getSelected());

        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
        for (int i=0;i<information.getMovies().size();i++){
            for (int j=0;j<searchParams.size();j++){
                if(information.getMovies().get(i).getName().contains(searchParams.get(j))||
                        information.getMovies().get(i).getGenre().contains(searchParams.get(j))

                        ){
                    MediaContent mediaContent = new MediaContent(information.getMovies().get(i));
                    mediaContents.add(mediaContent);
                    break;
                }
            }
        }
        System.out.println("done");
    }
}
