import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else db_url}")

try:
    conn = psycopg2.connect(db_url)
    print("SUCCESS: Connected to database!")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(f"DB Version: {cur.fetchone()}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"FAILURE: {e}")
