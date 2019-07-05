package UI;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

import javafx.scene.control.Button;
import java.io.IOException;

public class Gui extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        GridPane root = new GridPane();
//        try {
//            root = FXMLLoader.load(getClass().getResource("danial.fxml"));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        primaryStage.setTitle("Hello World");
        root.getStylesheets().add("UI/Danial.css");
        primaryStage.setScene(new Scene(root, 1200, 600));
        root.setGridLinesVisible(true);
        primaryStage.show();
    }
}
