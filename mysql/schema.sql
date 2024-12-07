-- Create the transactions table
CREATE TABLE transactions (  
    transaction_id VARCHAR(255) PRIMARY KEY,  
    timestamp DATETIME NOT NULL,  
    transaction_type VARCHAR(50) NOT NULL,  
    token VARCHAR(50) NOT NULL,  
    amount DECIMAL(20, 8) NOT NULL,  
    protocol VARCHAR(50) NOT NULL,  
    INDEX idx_timestamp (timestamp),  
    INDEX idx_token (token),  
    INDEX idx_protocol (protocol)  
) ENGINE=InnoDB;

-- Create the swaps table
CREATE TABLE swaps (
    swap_id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    token VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    INDEX idx_swap_timestamp (timestamp),
    INDEX idx_swap_token (token),
    INDEX idx_swap_protocol (protocol)
) ENGINE=InnoDB;
