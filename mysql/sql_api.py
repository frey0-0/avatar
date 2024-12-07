import pymysql
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Database connection details
DB_HOST = "localhost"
DB_USER = "myuser"
DB_PASSWORD = "mypassword"
DB_NAME = "transactions_db"


def get_binance_price(symbol):
    """Function to get the current price from Binance API"""
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    response = requests.get(url)
    data = response.json()
    return float(data["price"])


def fetch_closest_trades(symbol):
    """Fetch closest trades for the given symbol from the database"""
    current_price = get_binance_price(symbol + "USDC")

    query = """  
    WITH token_filtered AS (  
        SELECT   
            *,  
            ABS(amount - %s) AS amount_diff  
        FROM transactions  
        WHERE token = %s  
    ),  
    closest_trade AS (  
        SELECT   
            transaction_id,  
            amount_diff  
        FROM token_filtered  
        ORDER BY amount_diff ASC  
        LIMIT 1  
    ),  
    row_numbered AS (  
        SELECT   
            *,  
            ROW_NUMBER() OVER (ORDER BY timestamp) AS row_num  
        FROM token_filtered  
    ),  
    closest_row_num AS (  
        SELECT   
            row_num  
        FROM row_numbered  
        WHERE transaction_id = (SELECT transaction_id FROM closest_trade)  
    ),  
    result AS (  
        SELECT   
            *  
        FROM row_numbered  
        WHERE row_num BETWEEN   
            (SELECT row_num - 200 FROM closest_row_num) AND   
            (SELECT row_num + 200 FROM closest_row_num)  
    )  
    SELECT * FROM result;  
    """

    connection = pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
    )

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, (current_price, symbol))
            results = cursor.fetchall()

            return results[:100]
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        connection.close()


@app.route("/fetch_closest_trades", methods=["GET"])
def fetch_trades():
    """Endpoint to fetch the closest trades for a symbol"""
    symbol = request.args.get("symbol")
    if not symbol:
        return jsonify({"error": "Symbol parameter is required"}), 400

    trades = fetch_closest_trades(symbol)
    return jsonify(trades)


@app.route("/store_swap", methods=["POST"])
def store_swap():
    """Endpoint to store details of a swap in the swap table"""
    data = request.get_json()
    try:
        transaction_id = data["transaction_id"]
        timestamp = data["timestamp"]
        token = data["token"]
        amount = data["amount"]
        protocol = data["protocol"]

        # SQL query to insert swap data into the swap table
        query = """
        INSERT INTO swaps (transaction_id, timestamp, token, amount, protocol)
        VALUES (%s, %s, %s, %s, %s)
        """

        connection = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    query, (transaction_id, timestamp, token, amount, protocol)
                )
                connection.commit()
                return jsonify({"message": "Swap details stored successfully"}), 201
        except Exception as e:
            connection.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            connection.close()
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=6000)
