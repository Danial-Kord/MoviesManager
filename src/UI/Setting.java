package UI;

import com.company.*;
import com.sun.jnlp.ApiDialog;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashSet;

public class Setting {

    private TabPane settingPane;
    private BorderPane movieSetPathPane;
    private BorderPane backGroundChoose;
    ListView<TextField>pathListView;
    private Stage stage;
    private TextField backGroundTextField;
    private TextField pathFinder;
    private Information information;
    private InformationManagement informationManagement;
    private Gui gui;
    private IdManager idManager;
    public Setting(Information information , InformationManagement informationManagement,Gui gui){
        this.gui = gui;
        this.information = information;
        this.informationManagement = informationManagement;
        stage = new Stage();
        this.idManager = gui.getIdManager();
        settingPane = null;
        try {
            settingPane = FXMLLoader.load(getClass().getResource("setting.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        movieSetPathPane = (BorderPane)settingPane.getTabs().get(0).getContent();
        backGroundChoose = (BorderPane)settingPane.getTabs().get(1).getContent();


        pathListView = new ListView<TextField>();
        movieSetPathPane.setCenter(pathListView);
        for (String s : information.getPaths()) {
            TextField listTextField = new TextField(s);
            pathListView.getItems().add(listTextField);
            TextFieldManager.textFieldHandler(listTextField,pathListView,information.getPaths());
        }

        setSettingPaneHandler();
        stage.setScene(new Scene(settingPane,600,600));
        if((information.getPaths().size()==0)){
            setVisibale(true);
            Gui.root.setDisable(true);
            addPath();
        }
        Gui.root.setDisable(false);
        stage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent windowEvent) {
                if((pathListView.getItems().size()==0)){
                    setVisibale(true);
                    Gui.root.setDisable(true);
                    addPath();
                }
                else{
                    setVisibale(false);
                }
            }
        });

//        stage.getIcons().add(new Image("file:icon.png"));
        stage.getIcons().add(new Image(getClass().getResourceAsStream("icon.png")));

    }

    private void setSettingPaneHandler(){
        ToolBar toolBar = (ToolBar)movieSetPathPane.getBottom();
        final Button choose = (Button)toolBar.getItems().get(0);
        pathFinder = (TextField)toolBar.getItems().get(1);
        ToolBar toolBar2 = (ToolBar)backGroundChoose.getBottom();
        Button chooseBackGround = (Button)toolBar2.getItems().get(0);
        backGroundTextField = (TextField)toolBar2.getItems().get(1);

        final File selectedDirectory=null;
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                Button button = (Button) mouseEvent.getSource();
                if(button.equals(choose)) {
                    if (mouseEvent.getClickCount() == 1) {
                        addPath();
                    }
                }
                else {
                    changeBackGround();
                }
            }
        };
        choose.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
        chooseBackGround.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);

    }
    private void changeBackGround(){
        String background = backGroundTextField.getText();
        idManager.setBackGround(IdManager.pathHelper);
        if(backGroundTextField.getText().equals("")){
            backGroundChoose.setDisable(true);
            FileChooser fileChooser = new FileChooser();
            File selectedDirectory = fileChooser.showOpenDialog(new Stage());
            try {
                background = selectedDirectory.getAbsolutePath();
            }
            catch (NullPointerException e){
                background =null;
            }
        }
        if(background!=null && !background.equals("")){
            if(Sorting.isPicture(new File(background))){
                File file = new File("D:\\Projects\\JAVA\\MoviesManager\\src\\UI\\design.jpg");

                if(file.exists())
                    System.out.println("dsdasdadasdada");
                try {
                    Files.copy(new File(background).toPath(),
                            (file.toPath()),
                            StandardCopyOption.REPLACE_EXISTING);
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("You should reset Program");
//                    alert.setHeaderText("Look, an Information Dialog");
                    alert.setContentText("Ok I will restart it");

                    alert.showAndWait();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                idManager.setBackGround(IdManager.path);
            }
        }
    }
    private void addPath(){
        String choosePath=pathFinder.getText();
        if(pathFinder.getText().equals("")){
            settingPane.setDisable(true);
            DirectoryChooser directoryChooser = new DirectoryChooser();
            File selectedDirectory = directoryChooser.showDialog(new Stage());
            try {
                choosePath = selectedDirectory.getAbsolutePath();
            }
            catch (NullPointerException e){
                choosePath =null;
            }
        }
        if(information.getPaths().size() == 0 && choosePath==null){
            addPath();
            return;
        }
        settingPane.setDisable(false);
        int size = information.getPaths().size();
        information.addPath(choosePath);
        if(size != information.getPaths().size()){
            TextField listTextField = new TextField(choosePath);
            pathListView.getItems().add(listTextField);
            TextFieldManager.textFieldHandler(listTextField,pathListView,information.getPaths());
        }
        informationManagement.addInformation(choosePath,information);
        MenuItem menuItem = new MenuItem(choosePath);
        gui.getFolders().getMenuButton().getItems().add(menuItem);
        gui.getFolders().setListener(menuItem);
//        for (int i=0;i<information.getMovies().size();i++) {
//            mediaContents.add(new MediaContent(information.getMovies().get(i)));
//        }
        informationManagement.checkNewMovies(information,gui);
        System.out.println(choosePath);
        InfoSaver.save(information);
        if(information.getPaths().size()==1)
        stage.close();

    }
    public void setVisibale(boolean in){
        if(in)
        stage.show();
    }
}
