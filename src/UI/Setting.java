package UI;

import com.company.InfoSaver;
import com.company.Information;
import com.company.InformationManagement;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;

public class Setting {

    private TabPane settingPane;
    private BorderPane movieSetPathPane;
    ListView<TextField>pathListView;
    private Stage stage;
    private TextField pathFinder;
    private Information information;
    private InformationManagement informationManagement;
    private Gui gui;
    public Setting(Information information , InformationManagement informationManagement,Gui gui){
        this.gui = gui;
        this.information = information;
        this.informationManagement = informationManagement;
        stage = new Stage();

        settingPane = null;
        try {
            settingPane = FXMLLoader.load(getClass().getResource("setting.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        movieSetPathPane = (BorderPane)settingPane.getTabs().get(0).getContent();


        pathListView = new ListView<TextField>();
        movieSetPathPane.setCenter(pathListView);
        for (String s : information.getPaths()) {
            TextField listTextField = new TextField(s);
            pathListView.getItems().add(listTextField);
            TextFieldManager.textFieldHandler(listTextField,pathListView);
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
    }

    private void setSettingPaneHandler(){
        ToolBar toolBar = (ToolBar)movieSetPathPane.getBottom();
        Button choose = (Button)toolBar.getItems().get(0);
        pathFinder = (TextField)toolBar.getItems().get(1);
        final File selectedDirectory=null;
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()==1){
                    addPath();
                }
            }
        };
        choose.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
    }
    private void addPath(){
        String choosePath=pathFinder.getText();
        if(pathFinder.getText().equals("")){
            settingPane.setDisable(true);
            DirectoryChooser directoryChooser = new DirectoryChooser();
            File selectedDirectory = directoryChooser.showDialog(new Stage());
            choosePath = selectedDirectory.getAbsolutePath();
        }
        settingPane.setDisable(false);
        TextField listTextField = new TextField(choosePath);
        pathListView.getItems().add(listTextField);
        TextFieldManager.textFieldHandler(listTextField,pathListView);
        information.addPath(choosePath);
        Gui.root.setDisable(true);
        informationManagement.addInformation(choosePath,information);
        ArrayList<MediaContent>mediaContents = new ArrayList<MediaContent>();
//        for (int i=0;i<information.getMovies().size();i++) {
//            mediaContents.add(new MediaContent(information.getMovies().get(i)));
//        }
        informationManagement.checkNewMovies(information,gui,mediaContents);
        System.out.println(choosePath);
        InfoSaver.save(information);
        stage.close();

    }
    public void setVisibale(boolean in){
        if(in)
        stage.show();
    }
}
