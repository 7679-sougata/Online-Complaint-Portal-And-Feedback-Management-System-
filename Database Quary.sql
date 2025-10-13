CREATE DATABASE ocp;
USE ocp;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
SELECT * FROM users;
DELETE FROM users WHERE id=3;


CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT, -- optional, if you want to link with users table
  submission_type ENUM('Public','Anonymous') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_path VARCHAR(255), -- store uploaded file path
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from complaints;



















-- Drop old tables if they exist
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
ALTER TABLE complaints ADD COLUMN submission_type ENUM('Public','Anonymous') NOT NULL DEFAULT 'Public';
ALTER TABLE complaints ADD COLUMN file_path VARCHAR(255);
select * from complaints;


-- Create media uploads table
CREATE TABLE media_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT,
  file_path VARCHAR(255),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

-- Create status logs table
CREATE TABLE status_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT,
  status VARCHAR(50),
  comment TEXT,
  updated_by INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create escalations table
CREATE TABLE escalations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT,
  escalated_to INT,
  reason TEXT,
  escalated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_resolved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (escalated_to) REFERENCES users(id)
);

-- Create reports table
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  generated_by INT,
  report_type VARCHAR(50),
  report_path VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id)
);


SELECT * FROM complaints;

delete from complaints where id<4;


ALTER TABLE complaints ADD COLUMN assigned_to INT DEFAULT NULL;
ALTER TABLE complaints ADD FOREIGN KEY (assigned_to) REFERENCES users(id);


DESCRIBE users;
INSERT INTO users (name, email, password, role)
VALUES ('System Admin', 'admin@gmail.com', 'admin123', 'admin');

