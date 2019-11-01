package UI;

import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.StackPane;

public class TabManager {
    TabPane mainPane;
    public TabManager(TabPane mainPane){
        this.mainPane = mainPane;
        for (int i=0;i<mainPane.getTabs().size();i++){
            mainPane.getTabs().get(i).setId("deActiveTab");
            eventHandler(mainPane.getTabs().get(i));
        }
        mainPane.getTabs().get(0).setId("activeTab");
        mainPane.getTabs().get(mainPane.getTabs().size()-1).setId("add");

    }
    private void eventHandler(final Tab tab){

        EventHandler<Event>eventHandler = new EventHandler<Event>() {
            @Override
            public void handle(Event event) {
                MouseEvent m = null;
                try {
                    m = (MouseEvent) event;
                }
                catch (ClassCastException e){
                    System.out.println("didi");
                }
                if(m!=null)
                if(m.getButton().equals(MouseButton.SECONDARY)){
                    ContextMenuManager.onTabPane(mainPane, tab,m.getScreenX(),m.getScreenY());

                    return;
                }
                boolean hit = false;
                if(tab.getId().equals("add")){
                    hit = true;
                    tab.setId("activeTab");
                    tab.setText("tab"+mainPane.getTabs().size());
                    mainPane.getTabs().add(new Tab("+"));
                    mainPane.getTabs().get(mainPane.getTabs().size()-1).setId("add");
                    BorderPane borderPane = new BorderPane();
                    borderPane.setCenter(new StackPane());
                    mainPane.getTabs().get(mainPane.getTabs().size()-1).setContent(borderPane);
                    eventHandler(mainPane.getTabs().get(mainPane.getTabs().size()-1));
            }
                else if(tab.getId().equals("deActiveTab")){
                    hit = true;
                    tab.setId("activeTab");
                }
                if(hit){
                    for (Tab tab1 : mainPane.getTabs()) {
                        if(!tab.equals(tab1) && !tab1.getId().equals("add")){
                            tab1.setId("deActiveTab");
                        }
                    }
                }

        }
        };
        tab.setOnSelectionChanged(eventHandler);
//        tab.setOnClosed(eventHandler);
    }
}
