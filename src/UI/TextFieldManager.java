package UI;

import javafx.event.EventHandler;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;

import java.util.ArrayList;
import java.util.HashSet;


public class TextFieldManager {

    public static void textFieldHandler(TextField textField, final ListView<TextField>toolBarListView, final ArrayList<String>targets){

        final EventHandler<MouseEvent> textFieldMouse = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()>=2) {
                    javafx.scene.control.TextField textField = (javafx.scene.control.TextField) mouseEvent.getSource();
                    textField.setEditable(true);
                }
            }
        };
        final EventHandler<KeyEvent>textFieldKey = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                javafx.scene.control.TextField textField = (javafx.scene.control.TextField) keyEvent.getSource();
                if(keyEvent.getCode().equals(KeyCode.ENTER)) {
                    textField.setEditable(false);
                }
                else if(keyEvent.getCode().equals(KeyCode.DELETE)){
                    targets.remove(textField.getText());
                    toolBarListView.getItems().remove(textField);
                }
            }
        };
        textField.setEditable(false);
        textField.addEventHandler(KeyEvent.KEY_PRESSED,textFieldKey);
        textField.addEventHandler(MouseEvent.MOUSE_CLICKED,textFieldMouse);
    }
    public static void textFieldHandler(TextField textField, final ListView<TextField>toolBarListView, final HashSet<String>targets){

        final EventHandler<MouseEvent> textFieldMouse = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getClickCount()>=2) {
                    javafx.scene.control.TextField textField = (javafx.scene.control.TextField) mouseEvent.getSource();
                    textField.setEditable(true);
                }
            }
        };
        final EventHandler<KeyEvent>textFieldKey = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                javafx.scene.control.TextField textField = (javafx.scene.control.TextField) keyEvent.getSource();
                if(keyEvent.getCode().equals(KeyCode.ENTER)) {
                    textField.setEditable(false);
                }
                else if(keyEvent.getCode().equals(KeyCode.DELETE)){
                    targets.remove(textField.getText());
                    toolBarListView.getItems().remove(textField);
                }
            }
        };
        textField.setEditable(false);
        textField.addEventHandler(KeyEvent.KEY_PRESSED,textFieldKey);
        textField.addEventHandler(MouseEvent.MOUSE_CLICKED,textFieldMouse);
    }
}
