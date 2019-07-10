package UI;

import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;

public class Setting {
    private TabPane settingPane;
    private BorderPane movieSetPathPane;
    ListView<TextField>pathListView;
    private Stage stage;
    public Setting(){
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
        setSettingPaneHandler();
        stage.setScene(new Scene(settingPane,600,600));

    }

    private void setSettingPaneHandler(){
        ToolBar toolBar = (ToolBar)movieSetPathPane.getBottom();
        Button choose = (Button)toolBar.getItems().get(0);
        final TextField textField = (TextField)toolBar.getItems().get(1);
        final File selectedDirectory=null;
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()==1){
                    String choosePath=textField.getText();
                    if(textField.getText().equals("")){
                        settingPane.setDisable(true);
                        DirectoryChooser directoryChooser = new DirectoryChooser();
                        File selectedDirectory = directoryChooser.showDialog(new Stage());
                        choosePath = selectedDirectory.getAbsolutePath();
                    }
                    settingPane.setDisable(false);
                    TextField listTextField = new TextField(choosePath);
                    textField.setEditable(false);
                    pathListView.getItems().add(listTextField);
                    TextFieldManager.textFieldHandler(listTextField,pathListView);
                }
            }
        };
        choose.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
    }
    public void setVisibale(boolean in){
        if(in)
        stage.show();
    }
}
