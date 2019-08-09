package UI;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Pagination;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.StackPane;
import javafx.util.Callback;

import java.util.ArrayList;

public class PaginationManager {
    private ArrayList<MediaContent> mediaContents;
    private Pagination pagination;
    private StackPane stackPane;
    private BorderPane borderPane;
    static final int itemsPerPage = 50;
    public PaginationManager(final ArrayList<MediaContent>mediaContents, BorderPane borderPane){
        this.mediaContents = mediaContents;
        this.stackPane = (StackPane) borderPane.getCenter();
        this.borderPane = borderPane;
        pagination = new Pagination(mediaContents.size()/itemsPerPage +1, 0);
        pagination.setStyle("-fx-border-color:red;");
        pagination.setPageFactory(new Callback<Integer, Node>() {

            @Override
            public Node call(Integer pageIndex) {
//                if (pageIndex >= mediaContents.size()/itemsPerPage) {
//                    return null;
//                } else {
                    return createPage(pageIndex);
//                }
            }
        });
        borderPane.setBottom(pagination);

    }
    public FlowPane createPage(int input){
        final FlowPane flowPane = new FlowPane();
        flowPane.setPadding(new Insets(5, 5, 5, 5));
        flowPane.setVgap(5);
        flowPane.setHgap(5);
        flowPane.setAlignment(Pos.CENTER);
//        flowPane.setId("backGroundRepeat");
        final ScrollPane scroll = new ScrollPane();
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Horizontal scroll bar
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);    // Vertical scroll bar
        scroll.setContent(flowPane);
        scroll.viewportBoundsProperty().addListener(new ChangeListener<Bounds>() {
            @Override
            public void changed(ObservableValue<? extends Bounds> ov, Bounds oldBounds, Bounds bounds) {
                flowPane.setPrefWidth(bounds.getWidth());
                flowPane.setPrefHeight(bounds.getHeight());
            }
        });
        for (int i=input*itemsPerPage;i<mediaContents.size() && i<input*itemsPerPage+itemsPerPage;i++){
            flowPane.getChildren().add(mediaContents.get(i).getStackPane());
        }
        stackPane.getChildren().addAll(scroll);
        return flowPane;
    }
}
