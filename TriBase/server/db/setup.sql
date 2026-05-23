-- Setup LearnDB Platform Database
DROP DATABASE IF EXISTS learndb;
DROP ROLE IF EXISTS learndb_admin;
CREATE ROLE learndb_admin WITH LOGIN PASSWORD 'learndb_password' CREATEDB;
CREATE DATABASE learndb OWNER learndb_admin;
\connect learndb

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE learndb TO learndb_admin;
GRANT ALL ON SCHEMA public TO learndb_admin;
