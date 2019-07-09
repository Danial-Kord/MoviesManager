package UI;

import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.control.MenuButton;
import javafx.scene.control.MenuItem;
import javafx.scene.input.MouseEvent;

import java.util.ArrayList;

public class MenuButtonManager {
    private MenuButton menuButton;
    private String selected=null;
    public MenuButtonManager(MenuButton menuButton){
        this.menuButton = menuButton;
        setListener();
    }

    public void setListener(){

        EventHandler<Event>mouseEventEventHandler = new EventHandler<Event>() {
            @Override
            public void handle(Event event) {
                selected = ((MenuItem) event.getSource()).getText();
                if (selected.equals("add new")) {

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
}
