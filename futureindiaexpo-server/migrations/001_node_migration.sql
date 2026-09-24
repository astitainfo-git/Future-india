-- Run once against the existing CodeIgniter database before starting the Node API.

-- bcrypt hashes are 60 characters; legacy base64 passwords are upgraded automatically on next login.
ALTER TABLE users MODIFY password VARCHAR(255) NULL;
ALTER TABLE adminusers MODIFY password VARCHAR(255) NOT NULL;

-- The PHP checkout tried to save special_note, but CodeIgniter silently dropped it (not in allowedFields).
-- Skip this line if the column already exists.
ALTER TABLE orders ADD COLUMN special_note TEXT NULL;
