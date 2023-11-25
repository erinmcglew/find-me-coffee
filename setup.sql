DROP DATABASE findmecoffee;
CREATE DATABASE findmecoffee;
\c findmecoffee
CREATE TABLE shops (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100),
	location VARCHAR(100)
);
CREATE TABLE users (
    id VARCHAR(100),
    username VARCHAR(100)
);
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id),
    user_id VARCHAR(100),
    rating FLOAT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
