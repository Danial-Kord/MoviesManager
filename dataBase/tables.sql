#  create database DanialMovieManager character set = utf8;
#
# drop database DanialMovieManager;
# drop table MovieDirector;
# drop table MovieActor;
#
# drop table movies;
#
# drop table actor;

# show tables;
# #Movies
# select *
# from movies;

# alter table movies drop;

create table movies(

  id    int auto_increment,
  name  varchar(200),
  year  int(4) ,
  IMDBScore int(5),
  IMDBRating    numeric(3,1),
  duration  datetime,
  numberOfVotes int(6),
  summery  varchar(5000) , #chec
  primary key (id)
);


create table user(
  name  varchar(100),
  primary key (name)
);




create table MovieLike(
    user  varchar(100),
    movie_id int,
    primary key (user,movie_id),
    foreign key (user) references user(name),
    foreign key (movie_id) references movies(id)
);



create table Category(
  name  varchar(100),
  user  varchar(30),
  primary key (name,user),
  foreign key (user) references user(name)
);

create table MovieCategory(
    category_name   varchar(100),
    user  varchar(30),
    movie_id int,
    primary key (category_name,movie_id,user),
    foreign key (category_name,user) references Category(name,user),
    foreign key (movie_id) references movies(id)
);

create table genre(
    type    varchar(30),
    primary key (type)
);

create table movieGenre(
    type    varchar(30),
    movie_id int,
    primary key (type,movie_id),
    foreign key (type) references genre(type),
    foreign key (movie_id) references movies(id)
);

create table director(
    id  int auto_increment,
    name    varchar(30),
    primary key (id)
);

create table actor(
    id  int auto_increment,
    name    varchar(30),
    primary key (id)
);


create table MovieDirector(
    director_id   int,
    movie_id int,
    primary key (director_id,movie_id),
    foreign key (director_id) references director(id),
    foreign key (movie_id) references movies(id)
);

create table MovieActor(
    actor_id   int,
    movie_id int,
    primary key (actor_id,movie_id),
    foreign key (actor_id) references actor(id),
    foreign key (movie_id) references movies(id)
);

