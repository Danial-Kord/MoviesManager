package UI;

import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.*;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.IOException;

public class Setting {
    private TabPane settingPane;
    private BorderPane movieSetPathPane;
    ListView<TextField>pathListView;
    public Setting(){
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
    }

    private void setSettingPaneHandler(){
        ToolBar toolBar = (ToolBar)movieSetPathPane.getBottom();
        Button choose = (Button)toolBar.getItems().get(0);
        final TextField textField = (TextField)toolBar.getItems().get(1);

        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()==1){
                    String choosePath=textField.getText();
                    if(textField.getText().equals("")){
                        settingPane.setDisable(true);
                        FileChooser fileChooser = new FileChooser();
                        fileChooser.setTitle("Open Resource File");
                        fileChooser.showOpenDialog(new Stage());
                    }
                    TextField listTextField = new TextField(choosePath);
                    pathListView.getItems().add(listTextField);
                    TextFieldManager.textFieldHandler(listTextField,pathListView);
                }
            }
        };
        choose.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
    }
}
