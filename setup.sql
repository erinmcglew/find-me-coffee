DROP DATABASE findmecoffee;
CREATE DATABASE findmecoffee;
\c findmecoffee

CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    is_owner BOOLEAN DEFAULT FALSE
);

CREATE TABLE shops (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100),
    address VARCHAR(200),
	location VARCHAR(100),
    address VARCHAR(200),
    owner_id VARCHAR(100) REFERENCES users(id),
    description VARCHAR(500)

);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id),
    user_id VARCHAR(100),
    rating FLOAT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagestring TEXT
);
