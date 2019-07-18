package UI;

import com.company.Information;
import com.company.Movie;
import com.company.Sorting;
import com.sun.glass.ui.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Cursor;
import javafx.scene.Node;
import javafx.scene.Scene;
import java.util.ListResourceBundle;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseDragEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.*;
import javafx.scene.media.MediaView;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import sun.security.util.Resources_fr;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.Locale;
import java.util.ResourceBundle;

public class MediaContent {
    private Movie movie;
    private StackPane stackPane;
    private Text summery;
    private ImageView image;
    private Font font;
    private ProgressIndicator progressIndicator;
    private Information information;
    private MediaContent mediaContent;
    public MediaContent(final Movie movie,Information information){
        this.movie = movie;
        this.information = information;
        font = new Font("Times New Roman",12);

        summery = new Text(movie.getYear() +"\n"+movie.getName()+"\n genres : "+movie.getGenre()+"\n"+
                "directors : \n"+  movie.getDirectors()+"\n"+"Actors :"+"\n"+movie.getActors()
        );
        summery.setId("bold");
        FileInputStream input= null;
        try {
            if( Information.isPathExist(movie.getImagePath())) {
                input = new FileInputStream(movie.getImagePath());
            }
            else
            input = new FileInputStream("src\\IMDB.jpg");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        progressIndicator = new ProgressIndicator();
        progressIndicator.setProgress(0);
        progressIndicator.setPrefWidth(10);
//        Application.invokeLater(new Runnable() {
//            @Override
//            public void run() {
//                progressIndicator.setVisible(true);
//                double i=0;
//                while (!movie.isUpdatedFromNet()){
//                    i+=0.00000001;
//                    progressIndicator.setProgress(i);
//                    if(i>=1)
//                        i=0;
//
//                }
//                progressIndicator.setVisible(false);
//
//            }
//        });

        Image image1 = new Image(input);
         image =new ImageView(image1);
         summery.setVisible(false);
         setImageSize(172,275);
         setTextSize(image.getFitWidth(),image.getFitHeight());
        stackPane = new StackPane();
        stackPane.getChildren().add(image);
        stackPane.getChildren().add(summery);
//        stackPane.getChildren().add(progressIndicator);
        setEventHandler();
        summery.setFont(this.font);
        mediaContent = this;
    }

    public ProgressIndicator getProgressIndicator() {
        return progressIndicator;
    }

    public void setImageSize(double width, double height){
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
                     stackPane.setCursor(Cursor.HAND);
                    image.setId("shouldBeDark");
                    summery.setVisible(true);
                }
                else {
                    stackPane.setCursor(Cursor.DEFAULT);
                    image.setId("shouldBeLight");
                    summery.setVisible(false);
                }
                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_CLICKED) && mouseEvent.getButton().equals(MouseButton.PRIMARY)){
                    new MediaPane(movie,information);
                }
                else if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_CLICKED) && mouseEvent.getButton().equals(MouseButton.SECONDARY)){
                    ContextMenuManager.onMediaContent(mediaContent,stackPane,mouseEvent.getScreenX(),mouseEvent.getScreenY());

                }
            }
        };

        stackPane.addEventHandler(MouseEvent.MOUSE_EXITED,eventHandler);
        stackPane.addEventHandler(MouseEvent.MOUSE_ENTERED,eventHandler);
        stackPane.addEventHandler(MouseEvent.MOUSE_CLICKED,eventHandler);
    }

    public boolean updateInfo(Movie movie){
        if(!movie.isShow())
            return true;
        if(movie.getName().equals(this.movie.getName())&&
            movie.getYear().equals(this.movie.getYear())
                //TODO
        ){
//            this.movie = movie;
            summery.setText(movie.getYear() +"\n"+movie.getName()+"\n genres : "+movie.getGenre()+"\n"+
                    "directors : \n"+  movie.getDirectors()+"\n"+"Actors :"+"\n"+movie.getActors()
            );
            summery.setFont(font);
            if(movie.isUpdatedFromNet() && Sorting.isPathExist(movie.getFolderPath())) {
                FileInputStream input=null;
                try {
                    input = new FileInputStream(movie.getImagePath());
                    if(input!=null)
                    image.setImage(new Image(input));
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                }
            }
            return true;
        }
        return false;
    }
}
