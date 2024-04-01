create database if not exists task_app;
use task_app;

create table if not exists projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);

insert into projects (title, start_date, end_date) values ('Rails', '2024-04-01', '2024-04-10');