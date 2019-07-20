package UI;

import javafx.scene.control.TabPane;
import javafx.scene.layout.StackPane;

public class IdManager {
    private TabPane tabPane;
    private StackPane loading;
    public static String path = "backGroundRepeat";
    public static String pathHelper = "backGroundRepeatChange";
    public IdManager(TabPane tabPane,StackPane loading){
        this.loading = loading;
        this.tabPane = tabPane;
    }
    public void setBackGround(String id){
        tabPane.setId(id);
        loading.setId(id);
    }
}
