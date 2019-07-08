package UI;

import com.company.Movie;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.Pane;
import javafx.scene.media.MediaView;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class MediaContent {
    private Movie movie;
    private Text summery;
    private ImageView image;
    public MediaContent(Movie movie){
        this.movie = movie;
        summery = new Text(movie.getSummery());
        FileInputStream input= null;
        try {
            input = new FileInputStream(movie.getImagePath());
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Image image1 = new Image(input);
         image =new ImageView(image1);
         setImageSize(300,500);
    }
    public void setImageSize(double width,double height){
        image.setFitHeight(height);
        image.setFitWidth(width);
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Text getSummery() {
        return summery;
    }

    public void setSummery(Text summery) {
        this.summery = summery;
    }

    public ImageView getImage() {
        return image;
    }

    public void setImage(ImageView image) {
        this.image = image;
    }
}
