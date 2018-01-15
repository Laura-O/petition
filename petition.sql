DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR(255) not null,
    last VARCHAR(255) not null,
    email VARCHAR(255) UNIQUE,
    pass VARCHAR(255) not null,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    age VARCHAR(255),
    city VARCHAR(255),
    url VARCHAR(255),
    user_id integer REFERENCES users (id) UNIQUE
);

CREATE TABLE signatures (
    id SERIAL primary key,
    signature TEXT not null,
    user_id integer REFERENCES users (id) UNIQUE
);

