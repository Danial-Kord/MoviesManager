package UI;

import com.company.Movie;
import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseDragEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.*;
import javafx.scene.media.MediaView;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class MediaContent {
    private Movie movie;
    private StackPane stackPane;
    private Text summery;
    private ImageView image;
    public MediaContent(Movie movie){
        this.movie = movie;
        summery = new Text(movie.getYear());

        FileInputStream input= null;
        try {
//            input = new FileInputStream(movie.getImagePath());
            input = new FileInputStream("src\\Desert.jpg");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Image image1 = new Image(input);
         image =new ImageView(image1);
         summery.setVisible(false);
         setImageSize(300,500);
         setTextSize(image.getFitWidth(),image.getFitHeight());
        stackPane = new StackPane();
        stackPane.getChildren().add(image);
        stackPane.getChildren().add(summery);
        setEventHandler();

    }
    public void setImageSize(double width,double height){
        image.setFitHeight(height);
        image.setFitWidth(width);
    }
    public void setTextSize(double width,double height){
//        summery.prefHeight(height);
//        summery.maxHeight(height);
//        summery.minWidth(width);
//        summery.prefWidth(width);
        summery.setWrappingWidth(width - width/10);
    }

    public StackPane getStackPane() {
        return stackPane;
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
    private void setEventHandler(){
        EventHandler<MouseEvent>eventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_ENTERED)

//                       || (mouseEvent.getX() > image.getX() && mouseEvent.getX()<image.getX()+image.getFitWidth()
//                                && mouseEvent.getY() > image.getY()&& mouseEvent.getY()<image.getY()+image.getFitHeight())
                                )
                 {
                    image.setId("shouldBeDark");
                    summery.setVisible(true);
                }
                else {
                    image.setId("shouldBeLight");
                    summery.setVisible(false);
                }
            }
        };

        stackPane.addEventHandler(MouseEvent.MOUSE_EXITED,eventHandler);
        stackPane.addEventHandler(MouseEvent.MOUSE_ENTERED,eventHandler);
    }
}
