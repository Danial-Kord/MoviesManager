package UI;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.layout.TilePane;
import javafx.stage.Stage;

public class AttentionPane {
    public static void Error(String statement){

        Alert a = new Alert(Alert.AlertType.NONE);
        a.setAlertType(Alert.AlertType.ERROR);

        // set content text
        a.setContentText(statement);

        // show the dialog
        a.show();
    }
    public static void warning(String statement){

        Alert a = new Alert(Alert.AlertType.NONE);
        a.setAlertType(Alert.AlertType.WARNING);

        // set content text
        a.setContentText(statement);

        // show the dialog
        a.show();
    }
}
