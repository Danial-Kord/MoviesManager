package UI;

import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import java.io.IOException;

public class ProgressPane  {
    private Pane root;
    private Text info;
    private ProgressBar progressBar;
    private Button ok;
    private double maxValue;
    private double done;
    public ProgressPane(int maxValue){
        this.maxValue = maxValue;
        done = 0;
        final Stage stage = new Stage();
        try {
            root = FXMLLoader.load(getClass().getResource("progressPane.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        StackPane stackPane = (StackPane) root.getChildren().get(2);
        progressBar = (ProgressBar)stackPane.getChildren().get(0);
        info = (Text)root.getChildren().get(1);
        ok = (Button)root.getChildren().get(3);
//        progressBar.setPrefWidth(0);
        stage.setScene(new Scene(root,300,200));
        stage.show();
        ok.setDisable(true);
        ok.addEventHandler(MouseEvent.MOUSE_CLICKED, new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                stage.close();
            }
        });
    }
    public void increase(){
        done++;
        if(done>=maxValue)
            ok.setDisable(false);
        double value = done/maxValue;
        progressBar.setProgress(value);
    }


    public ProgressBar getProgressBar() {
        return progressBar;
    }
}
