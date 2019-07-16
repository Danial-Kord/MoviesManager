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
import javafx.stage.WindowEvent;

import java.io.IOException;
import java.util.ArrayList;

public class MenuButtonManager {
    private MenuButton menuButton;
    private String selected=null;
    private Stage stage  = null;
    private ListView<TextField>toolBarListView;
    private Information information;
    public MenuButtonManager(MenuButton menuButton ,Information information){
        this.information = information;
        this.menuButton = menuButton;
        if(menuButton.getText().equals("Categories")){
            addNewItem(false);
            if(information!=null)
            for (String item : information.categoriesTyps){
                TextField textField = new TextField(item);
                textField.setEditable(false);
                TextFieldManager.textFieldHandler(textField,toolBarListView,information.categoriesTyps);
                toolBarListView.getItems().add(textField);
                menuButton.getItems().get(menuButton.getItems().size()-1).setText(item);
                menuButton.getItems().add(new MenuItem("add new"));
            }
            stage.setOnCloseRequest(new EventHandler<WindowEvent>() {
                @Override
                public void handle(WindowEvent windowEvent) {
                    Gui.root.setDisable(false);
                }
            });
        }
        if(menuButton.getText().equals("Folder")){
            for (String path : information.getPaths()) {
                menuButton.getItems().add(new MenuItem(path));
            }
        }
        for (int i=0;i<menuButton.getItems().size();i++){
            setListener(menuButton.getItems().get(i));
        }
    }

    public MenuButton getMenuButton() {

        return menuButton;
    }

    public void setListener(MenuItem menuItem){

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
        menuItem.addEventHandler(Event.ANY,mouseEventEventHandler);
    }

    public String getSelected() {
        return selected;
    }
    public void addNewItem(boolean show){

        if(stage != null) {
            if(show)
            stage.show();
            Gui.root.setDisable(true);
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
                doOnEvent(searchBox);
            }
        };
        EventHandler<KeyEvent>keyEventEventHandler = new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent keyEvent) {
                if(keyEvent.getCode().equals(KeyCode.ENTER)){
                    doOnEvent(searchBox);
                }
            }
        };
        searchBox.addEventHandler(KeyEvent.KEY_PRESSED,keyEventEventHandler);
        ok.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEvent);
        if(show) {
            stage.show();
            Gui.root.setDisable(true);
        }
    }
    private void doOnEvent(TextField searchBox){
        int size = information.categoriesTyps.size();
        if(searchBox.getText().equals(""))
            return;
        String text = searchBox.getText();
        information.addCategoryType(text);
        if(information.categoriesTyps.size() == size)
            return;
        TextField textField = new TextField(searchBox.getText());
        TextFieldManager.textFieldHandler(textField,toolBarListView,information.categoriesTyps);
        toolBarListView.getItems().add(textField);
        menuButton.getItems().get(menuButton.getItems().size()-1).setText(searchBox.getText());
        menuButton.getItems().add(new MenuItem("add new"));
        setListener(menuButton.getItems().get(menuButton.getItems().size()-1));

    }
//    private void textFieldHandler(TextField textField){
//
//        final EventHandler<MouseEvent>textFieldMouse = new EventHandler<MouseEvent>() {
//            @Override
//            public void handle(MouseEvent mouseEvent) {
//                if(mouseEvent.getClickCount()>=2) {
//                    TextField textField = (TextField) mouseEvent.getSource();
//                    textField.setEditable(true);
//                }
//            }
//        };
//        final EventHandler<KeyEvent>textFieldKey = new EventHandler<KeyEvent>() {
//            @Override
//            public void handle(KeyEvent keyEvent) {
//                TextField textField = (TextField) keyEvent.getSource();
//                if(keyEvent.getCode().equals(KeyCode.ENTER)) {
//                    textField.setEditable(false);
//                }
//                else if(keyEvent.getCode().equals(KeyCode.DELETE)){
//                    toolBarListView.getItems().remove(textField);
//                }
//            }
//        };
//        textField.setEditable(false);
//        textField.addEventHandler(KeyEvent.KEY_PRESSED,textFieldKey);
//        textField.addEventHandler(MouseEvent.MOUSE_CLICKED,textFieldMouse);
//    }
}
