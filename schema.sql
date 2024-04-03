create database if not exists task_app;
use task_app;

create table if not exists projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);

create table if not exists tasks (
    id integer PRIMARY KEY AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    duration varchar(255) NOT NULL,
    description text,
    project_id integer NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

create table if not exists comments (
    id integer PRIMARY KEY AUTO_INCREMENT,
    commenter varchar(255) NOT NULL,
    body text NOT NULL,
    task_id integer NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

alter table projects add UNIQUE (title);
alter table tasks add UNIQUE (name);
