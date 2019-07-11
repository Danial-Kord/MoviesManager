package UI;

import com.company.Information;
import com.company.Movie;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.SplitMenuButton;
import javafx.scene.control.TextArea;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;


import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class MediaPane {
    private Movie movie;
    private AnchorPane root;
    private ImageView like;
    private SplitMenuButton categories;
    private TextArea details;
    public MediaPane(Movie movie){
        Stage primaryStage = new Stage();
        this.movie = movie;
        try {
            root = FXMLLoader.load(getClass().getResource("mediaContent.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        ImageView pic = (ImageView)root.getChildren().get(0);
        like = (javafx.scene.image.ImageView)root.getChildren().get(1);
        details = (TextArea)root.getChildren().get(2);
        categories = (SplitMenuButton)root.getChildren().get(3);

        FileInputStream input= null;
        FileInputStream input2= null;
        try {
            if(movie.isUpdatedFromNet() || Information.isPathExist(movie.getImagePath())) {
                input = new FileInputStream(movie.getImagePath());
            }
            else
                input = new FileInputStream("src\\IMDB.jpg");
            input2 = new FileInputStream("src\\like.jpg");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Image image = new Image(input);
        pic.setImage(image);
        Image image1 = new Image(input2);
        like.setImage(image1);
        details.setText("dsaddddddddddddddddddddd");
        root.setId("backGroundRepeat");
        root.getStylesheets().add("UI/Danial.css");

        primaryStage.setTitle("Movie Manager");
        primaryStage.setScene(new Scene(root, 700, 400));
        primaryStage.show();

    }
}
