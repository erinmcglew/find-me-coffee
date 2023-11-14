DROP DATABASE findmecoffee;
CREATE DATABASE findmecoffee;
\c findmecoffee
CREATE TABLE shops (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100),
	location VARCHAR(25)
);
CREATE TABLE users (
    id VARCHAR(25),
    username VARCHAR(25)
);
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id),
    user_id VARCHAR(25),
    rating FLOAT,
    comments TEXT
);
