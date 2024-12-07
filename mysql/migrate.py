import pandas as pd  
from sqlalchemy import create_engine  

# Database configuration  
DB_HOST = 'localhost'  # Change to your MySQL host  
DB_USER = 'myuser'       # Change to your MySQL username  
DB_PASSWORD = 'mypassword'  # Change to your MySQL password  
DB_NAME = 'transactions_db'  # Change to your database name  
TABLE_NAME = 'transactions'  

# CSV file path  
CSV_FILE = 'transactions.csv'  # Change to the path of your CSV file  

def main():  
    # Step 1: Read the CSV file into a pandas DataFrame  
    print("Reading CSV file...")  
    df = pd.read_csv(CSV_FILE)  

    # Step 2: Create a connection to the MySQL database  
    print("Connecting to the database...")  
    engine = create_engine(f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}')  

    # Step 3: Write the DataFrame to the MySQL table in bulk  
    print("Inserting data into the database...")  
    try:  
        # Use the `to_sql` method for bulk insert  
        df.to_sql(TABLE_NAME, con=engine, if_exists='append', index=False, chunksize=1000)  
        print("Data inserted successfully!")  
    except Exception as e:  
        print(f"An error occurred: {e}")  

if __name__ == '__main__':  
    main()  