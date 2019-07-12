package UI;

import com.company.*;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Task;
import javafx.concurrent.WorkerStateEvent;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Orientation;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.*;
import javafx.scene.media.MediaView;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import javafx.scene.control.ScrollBar;
import javafx.stage.WindowEvent;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;

public class Gui extends Application {
    MenuBar menuBar;
    ToolBar serach;
    ToolBar findFavorite;
    TabPane tabPane;
    StackPane mainPane;
    public static BorderPane root;
    TabManager tabManager;
    private InformationManagement informationManagement;
    private ImageView find250IMDB;
    private MenuButtonManager categories;
    private MenuButtonManager generes;
    private Information information;
    private Setting setting;
    private  ProgressBar progressBar;
    private StackPane loading;
    private Text loadingText;
    private ImageView likes;
    private Stage stage;
    private HBox hBox;
    private VBox vBox;
    private ArrayList<MediaContent>allMediaContents;
    public static void main(String[] args) {
        launch(args);
    }

//    public Gui(Information information,InformationManagement informationManagement){
//        this.information = information;
//        this.informationManagement = informationManagement;
//        start(new Stage());
//    }
    public void nothing(){
        while (true){}
    }
    @Override
    public void start(Stage primaryStage) {



    stage = primaryStage;
    allMediaContents = new ArrayList<MediaContent>();
//        final ProgressPane progressPane = new ProgressPane(10000);
//        Platform.runLater(new Runnable() {
//            @Override
//            public void run() {
//                double i=0;
//                while (i<10000){
//                    try {
//                        wait(1000);
//                    } catch (InterruptedException e) {
//                        e.printStackTrace();
//                    }
//                    i+=1;
//                    progressPane.increase();
//                }
//            }
//        });

//        Sorting.userInput(scanner.nextLine());
         root = null;
        try {
            root = FXMLLoader.load(getClass().getResource("MovieManager.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
         vBox = (VBox)root.getTop();
        menuBar = (MenuBar)vBox.getChildren().get(0);
         hBox = (HBox)vBox.getChildren().get(2);
        serach = (ToolBar)hBox.getChildren().get(0);
        findFavorite = (ToolBar)hBox.getChildren().get(1);
        findFavorite.setOrientation(Orientation.HORIZONTAL);

        loading = (StackPane)vBox.getChildren().get(1);
        loadingText = (Text)loading.getChildren().get(0);
        progressBar = (ProgressBar)loading.getChildren().get(1);
        loading.setId("backGroundRepeat");
        getLoadingText().setVisible(false);
        getProgressBar().setVisible(false);


        root.getStylesheets().add("UI/Danial.css");


        tabPane = (TabPane) root.getCenter();
        tabManager = new TabManager(tabPane);
        Node mainNode =  tabPane.getTabs().get(0).getContent();
        mainPane = (StackPane) (mainNode);

        Sorting.buildConditions();
        information = InfoSaver.read();
//        System.out.println(information.getMovies().get(0).getGenre());
        informationManagement = new InformationManagement();
//    informationManagment.addInformation("",information);
        informationManagement.checkNewMovies(information,this);
//        information.buildShortCuts();
        InfoSaver.save(information);
        categories = new MenuButtonManager((MenuButton)findFavorite.getItems().get(2),information);
        generes = new MenuButtonManager((MenuButton)findFavorite.getItems().get(3),information);
        find250IMDB = (ImageView) findFavorite.getItems().get(1);
        likes = (ImageView)findFavorite.getItems().get(0);


        StackPane stackPane = (StackPane) tabPane.getTabs().get(1).getContent();
        ListView<Text> textListView = new ListView<Text>();
        stackPane.getChildren().add(textListView);
        textListView.getItems().add(new Text("dsadadadad"));
        setSerachHandler();
        setting = new Setting(information,informationManagement,this);
        setMenuBarHandler();


        primaryStage.setTitle("Movie Manager");
        primaryStage.setScene(new Scene(root, 850, 600));
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


//        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();//TODO
        System.out.println(information.getMovies().size());
        for (int i=0;i<information.getMovies().size();i++) {
//            MediaContent mediaContent = new MediaContent(information.getMovies().get(i));
//            allMediaContents.add(mediaContent);
            updateOrAddMediaContent(information.getMovies().get(i));
        }
        setActivePaneContent(allMediaContents);





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
        stage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent windowEvent) {
                InfoSaver.save(information);
                stage.close();
            }
        });
    }

    public Text getLoadingText() {
        return loadingText;
    }

    public StackPane getLoading() {
        return loading;
    }

    public ProgressBar getProgressBar() {
        return progressBar;
    }

    public void findAll(){
        for (int i=0;i<information.getMovies().size();i++){
            updateOrAddMediaContent(information.getMovies().get(i));
        }
        setActivePaneContent(allMediaContents);
    }
    public void updateOrAddMediaContent(Movie movie){
        boolean flag = true;
        for (int i=0;i<allMediaContents.size();i++){
            if(allMediaContents.get(i).updateInfo(movie)){
                flag = false;
                break;
            }
        }
        if(flag){
            allMediaContents.add(new MediaContent(movie,information));
        }
    }
    public void setActivePaneContent(ArrayList<MediaContent>mediaContents,int tab) {
        Tab activeTab = tabPane.getTabs().get(tab);
        StackPane stackPane = (StackPane) activeTab.getContent();
        final FlowPane flowPane = new FlowPane();
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
        for (int i = 0; i < mediaContents.size(); i++) {
            flowPane.getChildren().add(mediaContents.get(i).getStackPane());
//            mediaContent.getSummery().setX(mediaContent.getImage().getX());
//            mediaContent.getSummery().setY(mediaContent.getImage().getY());
//            mediaContent.getSummery().setLayoutX(mediaContent.getImage().getLayoutX());
//            mediaContent.getSummery().setLayoutY(mediaContent.getImage().getLayoutY());
        }
    }
    public void setActivePaneContent(ArrayList<MediaContent>mediaContents) {

        for (int i=0;i<tabPane.getTabs().size();i++)
            if (tabPane.getTabs().get(i).getId().equals("activeTab")) {
                setActivePaneContent(mediaContents,i);
                break;
            }
        }
    public void setSerachHandler(){
        TextField searchBox = (TextField) serach.getItems().get(0);
        final Button ok = (Button) serach.getItems().get(1);
        Button findAll = (Button)serach.getItems().get(2);
        final EventHandler<MouseEvent>mouseEvent = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                Button button = (Button)mouseEvent.getSource();
                    if(button.equals(ok))
                    searchForResults();
                    else {
                        findAll();
                    }
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
        findAll.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEvent);

        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                ImageView imageView = (ImageView)mouseEvent.getSource();
                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_CLICKED)){
                    if(imageView.equals(likes))
                    findLikes();
                    else if(imageView.equals(find250IMDB))
                        find250IMDB();
                    return;
                }
                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_ENTERED)

//                       || (mouseEvent.getX() > image.getX() && mouseEvent.getX()<image.getX()+image.getFitWidth()
//                                && mouseEvent.getY() > image.getY()&& mouseEvent.getY()<image.getY()+image.getFitHeight())
                )
                {
                    vBox.setCursor(Cursor.HAND);

                }
                else {
                    vBox.setCursor(Cursor.DEFAULT);
                }

            }
        };
        likes.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
        likes.addEventHandler(MouseEvent.MOUSE_ENTERED,mouseEventEventHandler);
        likes.addEventHandler(MouseEvent.MOUSE_EXITED,mouseEventEventHandler);
        find250IMDB.addEventHandler(MouseEvent.MOUSE_EXITED,mouseEventEventHandler);
        find250IMDB.addEventHandler(MouseEvent.MOUSE_ENTERED,mouseEventEventHandler);
        find250IMDB.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
    }
    public void searchForResults(){
        ArrayList<String>searchParams = new ArrayList<String>();
        TextField searchBox = (TextField) serach.getItems().get(0);
        String name = searchBox.getText();
        String favorite="";
        String gener = "";
        searchParams.add(searchBox.getText());
        if(categories.getSelected()!=null) {
            searchParams.add(categories.getSelected());
            favorite = categories.getSelected();
        }
        if(generes.getSelected()!=null) {
            searchParams.add(generes.getSelected());
            gener = generes.getSelected();
        }


        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
//        for (int i=0;i<information.getMovies().size();i++){
//            for (int j=0;j<searchParams.size();j++){
//                if(searchParams.get(j).equals(""))
//                    continue;
//                System.out.println("...."+searchParams.get(j));
//                if(information.getMovies().get(i).getName().contains(searchParams.get(j))||
//                        information.getMovies().get(i).getGenre().contains(searchParams.get(j))||
//                        searchParams.get(j).equals("all")
//                        ){
//                    MediaContent mediaContent = new MediaContent(information.getMovies().get(i));
//                    mediaContents.add(mediaContent);
//                    break;
//                }
//            }

            for (int i=0;i<allMediaContents.size();i++){
                if(gener.equals("all")){
                    MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                    mediaContents.add(mediaContent);
                    continue;
                }
                if(!gener.equals("") && allMediaContents.get(i).getMovie().getGenre()!=null && !gener.equals("none"))
                if(allMediaContents.get(i).getMovie().getGenre().toLowerCase().contains(gener.toLowerCase())){
                    MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                    mediaContents.add(mediaContent);
                    continue;
                }
                if(!favorite.equals("")){

                    if(allMediaContents.get(i).getMovie().getFavorites().contains(favorite)){//TODO
                        MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                        mediaContents.add(mediaContent);
                        continue;
                    }
                    if(!name.equals(""))
                    if(allMediaContents.get(i).getMovie().getName().toLowerCase().contains(name.toLowerCase())){
                        MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                        mediaContents.add(mediaContent);
                        continue;
                    }
                }
            }
        System.out.println("done");
        setActivePaneContent(mediaContents);
    }
    public void find250IMDB(){
        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
        for (int i=0;i<allMediaContents.size();i++){
            if(allMediaContents.get(i).getMovie().getIMDBscore()!=null)
                if(!allMediaContents.get(i).getMovie().getIMDBscore().equals("")){
                    MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                    mediaContents.add(mediaContent);
                }
        }
        setActivePaneContent(mediaContents);
    }
    public void setMenuBarHandler(){
         Menu fileMenu = menuBar.getMenus().get(0);
        final MenuItem setting1 = fileMenu.getItems().get(0);
        final MenuItem save = fileMenu.getItems().get(1);
        final MenuItem exit = fileMenu.getItems().get(2);
        EventHandler<Event>eventHandler = new EventHandler<Event>() {
            @Override
            public void handle(Event mouseEvent) {
                if(mouseEvent.getSource().equals(setting1)){
                    setting.setVisibale(true);
                }
                else if(mouseEvent.getSource().equals(save)){
                    InfoSaver.save(information);
                }
                else if(mouseEvent.getSource().equals(exit)){
                    InfoSaver.save(information);
                    stage.close();
                }
            }
        };
        setting1.addEventHandler(Event.ANY,eventHandler);
        save.addEventHandler(Event.ANY,eventHandler);
        exit.addEventHandler(Event.ANY,eventHandler);
        //TODO
    }
    private void findLikes(){
        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
        for (int i=0;i<allMediaContents.size();i++){
                if(allMediaContents.get(i).getMovie().isFavoriteMovie()){
                    MediaContent mediaContent = new MediaContent(allMediaContents.get(i).getMovie(),information);
                    mediaContents.add(mediaContent);
                }
        }
        setActivePaneContent(mediaContents);
    }
}
