package UI;

import com.company.Information;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.ArrayList;

public class MenuButtonManager {
    private MenuButton menuButton;
    private String selected=null;
    private Stage stage  = null;
    private ListView<TextField>toolBarListView;
    public MenuButtonManager(MenuButton menuButton ,Information information){
        this.menuButton = menuButton;
        if(menuButton.getText().equals("Categories")){
            addNewItem(false);
            if(information!=null)
            for (String item : information.categoriesTyps){
                TextField textField = new TextField(item);
                textField.setEditable(false);
                textFieldHandler(textField);
                toolBarListView.getItems().add(textField);
            }
        }
        setListener();
    }

    public void setListener(){

        EventHandler<Event>mouseEventEventHandler = new EventHandler<Event>() {
            @Override
            public void handle(Event event) {
                selected = ((MenuItem) event.getSource()).getText();
                if (selected.equals("add new")) {
                    addNewItem(true);
                } else {
                    menuButton.setText(selected);

                }
            }
        };
        System.out.println(menuButton.getText());
        for (int i=0;i<menuButton.getItems().size();i++){
            menuButton.getItems().get(i).addEventHandler(Event.ANY,mouseEventEventHandler);
        }

    }

    public String getSelected() {
        return selected;
    }
    public void addNewItem(boolean show){

        if(stage != null) {
            if(show)
            stage.show();
            return;
        }
         stage = new Stage();
            BorderPane borderPane = new BorderPane();
            try {
                borderPane = FXMLLoader.load(getClass().getResource("addNewItem.fxml"));
            } catch (IOException e) {
                e.printStackTrace();
            }

        toolBarListView = new ListView<TextField>();
        borderPane.setCenter(toolBarListView);
        ToolBar toolBar = (ToolBar) borderPane.getBottom();
        Button ok = (Button) toolBar.getItems().get(0);
        final TextField searchBox = (TextField) toolBar.getItems().get(1);
        stage.setScene(new Scene(borderPane,300,400));



        EventHandler<MouseEvent>mouseEvent = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                TextField textField = new TextField(searchBox.getText());
                textFieldHandler(textField);
                toolBarListView.getItems().add(textField);
            }
        };
        EventHandler<KeyEvent>keyEventEventHandler = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                if(keyEvent.getCode().equals(KeyCode.ENTER)){
                    TextField textField = new TextField(searchBox.getText());
                    textField.setEditable(false);
                    textFieldHandler(textField);
                    toolBarListView.getItems().add(textField);
                }
            }
        };
        searchBox.addEventHandler(KeyEvent.ANY,keyEventEventHandler);
        ok.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEvent);
        if(show)
        stage.show();
    }
    private void textFieldHandler(TextField textField){

        final EventHandler<MouseEvent>textFieldMouse = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()>=2) {
                    TextField textField = (TextField) mouseEvent.getSource();
                    textField.setEditable(true);
                }
            }
        };
        final EventHandler<KeyEvent>textFieldKey = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                TextField textField = (TextField) keyEvent.getSource();
                if(keyEvent.getCode().equals(KeyCode.ENTER)) {
                    textField.setEditable(false);
                }
                else if(keyEvent.getCode().equals(KeyCode.DELETE)){
                    toolBarListView.getItems().remove(textField);
                }
            }
        };
        textField.setEditable(false);
        textField.addEventHandler(KeyEvent.KEY_PRESSED,textFieldKey);
        textField.addEventHandler(MouseEvent.MOUSE_CLICKED,textFieldMouse);
    }
}
