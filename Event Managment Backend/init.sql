-- Create all databases for Event Management System
CREATE DATABASE IF NOT EXISTS event_db;
CREATE DATABASE IF NOT EXISTS ticketing_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS attendee_db;
CREATE DATABASE IF NOT EXISTS venue_db;
CREATE DATABASE IF NOT EXISTS vendor_db;
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS announcer_db;
CREATE DATABASE IF NOT EXISTS loyalty_db;
CREATE DATABASE IF NOT EXISTS sponsorship_db;

-- Grant all privileges to admin user
GRANT ALL PRIVILEGES ON event_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON ticketing_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON booking_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON attendee_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON venue_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON vendor_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON event_management_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON announcer_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON loyalty_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON sponsorship_db.* TO 'admin'@'%';

FLUSH PRIVILEGES;
