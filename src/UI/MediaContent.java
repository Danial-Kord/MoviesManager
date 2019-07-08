package UI;

import com.company.Movie;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.Pane;
import javafx.scene.media.MediaView;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class MediaContent {
    private Movie movie;
    private Text summery;
    private ImageView image;
    public MediaView(Movie movie){
        this.movie = movie;
        summery = new Text(movie.getSummery());
//        image = new
    }
}
