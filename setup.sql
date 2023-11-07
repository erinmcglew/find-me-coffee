DROP DATABASE findmecoffee;
CREATE DATABASE findmecoffee;
\c findmecoffee
CREATE TABLE shops (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100),
	location VARCHAR(25)
);
