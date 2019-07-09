package UI;

import javafx.event.EventHandler;
import javafx.scene.control.MenuButton;
import javafx.scene.control.MenuItem;
import javafx.scene.input.MouseEvent;

import java.util.ArrayList;

public class MenuButtonManager {
    private MenuButton menuButton;
    private String selected;
    public MenuButtonManager(MenuButton menuButton){
        this.menuButton = menuButton;
        setLestiner();
    }

    public void setLestiner(){

        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                selected = ((MenuItem) mouseEvent.getSource()).getText();
                if (selected.equals("add new")) {

                } else {
                    System.out.println(selected);
                    menuButton.setText(selected);
                }
            }
        };
        ArrayList<MenuItem>menuItems = new ArrayList<MenuItem>();
        for (int i=0;i<menuButton.getItems().size();i++){
            menuItems.add((MenuItem)menuButton.getItems().get(i));
            menuItems.get(i).addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);

        }
    }
}
