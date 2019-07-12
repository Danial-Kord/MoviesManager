package UI;

import com.company.Information;
import com.company.Movie;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Cursor;
import javafx.scene.DepthTest;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Text;
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
    private GridPane detailsPane;
    public MediaPane(Movie movie,Information information){
        Stage primaryStage = new Stage();
        this.movie = movie;
        try {
            root = FXMLLoader.load(getClass().getResource("mediaContent.fxml"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        BorderPane borderPane = (BorderPane)root.getChildren().get(0);
        detailsPane = (GridPane)root.getChildren().get(1);
        ImageView pic = (ImageView)borderPane.getCenter();
        BorderPane borderPane1 = (BorderPane)borderPane.getBottom();
        ToolBar left = (ToolBar)borderPane1.getLeft();
        ToolBar right = (ToolBar)borderPane1.getRight();
        like = (javafx.scene.image.ImageView)left.getItems().get(0);
        categories = (SplitMenuButton)right.getItems().get(0);

        AnchorPane anchorPane = (AnchorPane)root.getChildren().get(2);
        Text IMDBScore = (Text)anchorPane.getChildren().get(1);
        Text year = (Text)anchorPane.getChildren().get(3);
        StackPane stackPane =(StackPane)anchorPane.getChildren().get(4);
        Text IMDBRating = (Text)stackPane.getChildren().get(1);

        if(movie.getIMDBscore()!=null){
            if(!movie.getIMDBscore().equals(""))
                IMDBScore.setText(movie.getIMDBscore());
        }
        if(movie.getIMDBrating()!=null){
            if(!movie.getIMDBrating().equals(""))
                IMDBRating.setText(movie.getIMDBrating());
        }
        if(movie.getYear()!=null){
            if(!movie.getYear().equals(""))
                year.setText(movie.getYear());
        }
        FileInputStream input= null;
        FileInputStream input2= null;
        try {
            if(movie.isUpdatedFromNet() || Information.isPathExist(movie.getImagePath())) {
                input = new FileInputStream(movie.getImagePath());
            }
            else
                input = new FileInputStream("src\\IMDB.jpg");
//            input2 = new FileInputStream("src\\like.jpg");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Image image = new Image(input);
        pic.setImage(image);
//        Image image1 = new Image(input2);
//        like.setId("");
        for (String favorite: information.categoriesTyps){
            if(favorite.equals(""))
                continue;
            MenuItem menuItem = new MenuItem();
            RadioButton radioButton = new RadioButton(favorite);
            for (String s : movie.getFavorites()) {
                if (s.equals(favorite)) {
                    System.out.println(favorite);
                    radioButton.setSelected(true);
                }
            }
            menuItem.setGraphic(radioButton);
            categories.getItems().add(0,menuItem);
            setRadioButtonHandler(radioButton);
        }
        if(!movie.isFavoriteMovie())
        like.setId("shouldBeDark");
        setHandler();
        root.setId("backGroundRepeat");
        root.getStylesheets().add("UI/Danial.css");

        primaryStage.setTitle("Movie Manager");
        primaryStage.setScene(new Scene(root, 700, 400));
        primaryStage.setResizable(false);
        primaryStage.show();

    }
    private void setRadioButtonHandler(final RadioButton radioButtonHanler){
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {
//                if (mouseEvent.getClickCount() == 1 && mouseEvent.getButton().equals(0) && mouseEvent.getEventType().equals(MouseEvent.MOUSE_CLICKED)) {
                    if(movie.getFavorites().contains(radioButtonHanler.getText())){
                        movie.getFavorites().remove(radioButtonHanler.getText());
                    }
                    else
                    movie.getFavorites().add(radioButtonHanler.getText());
//                }
            }
        };
        radioButtonHanler.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
    }
    public void setHandler(){
        EventHandler<MouseEvent>mouseEventEventHandler = new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent mouseEvent) {

                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_ENTERED)

//                       || (mouseEvent.getX() > image.getX() && mouseEvent.getX()<image.getX()+image.getFitWidth()
//                                && mouseEvent.getY() > image.getY()&& mouseEvent.getY()<image.getY()+image.getFitHeight())
                )
                {
                    root.setCursor(Cursor.HAND);
                    if(!movie.isFavoriteMovie())
                        like.setId("shouldBeLight");
                }
                else {
                    root.setCursor(Cursor.DEFAULT);
                    if(!movie.isFavoriteMovie())
                        like.setId("shouldBeDark");

                }
                if(mouseEvent.getEventType().equals(MouseEvent.MOUSE_CLICKED)){
                    if(!movie.isFavoriteMovie()) {
                        like.setId("shouldBeLight");
                        movie.setFavoriteMovie(true);
                    }
                    else {
                        like.setId("shouldBeDark");
                        movie.setFavoriteMovie(false);
                    }
                }
            }
        };
        like.addEventHandler(MouseEvent.MOUSE_CLICKED,mouseEventEventHandler);
        like.addEventHandler(MouseEvent.MOUSE_ENTERED,mouseEventEventHandler);
        like.addEventHandler(MouseEvent.MOUSE_EXITED,mouseEventEventHandler);
    }
}