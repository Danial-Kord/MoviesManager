package UI;

import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.Node;
import javafx.scene.control.ContextMenu;
import javafx.scene.control.MenuItem;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.StackPane;

import java.util.ArrayList;

public class ContextMenuManager {
    public static Gui gui;
    public static void onTabPane(final TabPane tabPane , final Tab active,double x ,double y){
        ContextMenu contextMenu = new ContextMenu();
        contextMenu.getItems().add(new MenuItem("Delete"));
//        contextMenu.getItems().add(new MenuItem("Rename"));
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                MenuItem menuItem = (MenuItem) mouseEvent.getSource();
                if(menuItem.getText().equals("Delete")){
                    tabPane.getTabs().remove(active);
                }
                else if(menuItem.getText().equals("Rename")){
                }
            }
        };
        for (int i=0;i<contextMenu.getItems().size();i++){
            contextMenu.getItems().get(i).addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
        }
        contextMenu.show(tabPane,x,y);

    }
    public static void onMediaContent(final MediaContent mediaContent, StackPane stackPane,double x ,double y){
        ContextMenu contextMenu = new ContextMenu();
        contextMenu.getItems().add(new MenuItem("Delete"));
        contextMenu.getItems().add(new MenuItem("Visible"));
        contextMenu.getItems().add(new MenuItem("Like"));
        EventHandler<Event>mouseEventEventHandler = new EventHandler<Event>() {
            @Override
            public void handle(Event mouseEvent) {
                MenuItem menuItem = (MenuItem) mouseEvent.getSource();
                if(menuItem.getText().equals("Delete")){
                    mediaContent.getMovie().setShow(false);
                    gui.getAllMediaContents().remove(mediaContent);
                }
                else if(menuItem.getText().equals("Visible")){
                    mediaContent.getMovie().setShow(true);
                    gui.updateOrAddMediaContent(mediaContent.getMovie());
                }
                else if(menuItem.getText().equals("Like")){
                    mediaContent.getMovie().setFavoriteMovie(true);
                }
            }
        };
        for (int i=0;i<contextMenu.getItems().size();i++){
            contextMenu.getItems().get(i).addEventHandler(Event.ANY,mouseEventEventHandler);
        }
        contextMenu.show(stackPane,x,y);
    }

}
