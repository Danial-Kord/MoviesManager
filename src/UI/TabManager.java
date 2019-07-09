package UI;

import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.input.MouseEvent;
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
                boolean hit = false;
                if(tab.getId().equals("add")){
                    hit = true;
                    tab.setId("activeTab");
                    tab.setText("tab"+mainPane.getTabs().size());
                    mainPane.getTabs().add(new Tab("+"));
                    mainPane.getTabs().get(mainPane.getTabs().size()-1).setId("add");
                    mainPane.getTabs().get(mainPane.getTabs().size()-1).setContent(new StackPane());
                    eventHandler(mainPane.getTabs().get(mainPane.getTabs().size()-1));
            }
                else if(tab.getId().equals("deActiveTab")){
                    hit = true;
                    tab.setId("activePane");
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
    }
}
