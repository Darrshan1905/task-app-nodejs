create database if not exists task_app;
use task_app;


CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'normal user') NOT NULL DEFAULT 'normal user',
    CONSTRAINT check_name_length CHECK (LENGTH(name) >= 3)
);

create table if not exists projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title varchar(255) NOT NULL UNIQUE CHECK(LENGTH(title) >= 5),
    start_date date NOT NULL,
    end_date date NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

create table if not exists tasks (
    id integer PRIMARY KEY AUTO_INCREMENT,
    name varchar(255) NOT NULL UNIQUE,
    duration varchar(255) NOT NULL,
    description text,
    project_id integer NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

create table if not exists comments (
    id integer PRIMARY KEY AUTO_INCREMENT,
    commenter varchar(255) NOT NULL CHECK (LENGTH(commenter) >= 3),
    body text NOT NULL CHECK(LENGTH(body) >= 5),
    task_id integer NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



