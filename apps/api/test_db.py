import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.domain import Base, User, UserRole, UserRoleMapping

def test_connection():
    urls = [
        str(settings.DATABASE_URL),
        "postgresql://postgres:8jAvIV9d05lJwPhU@db.zglaodhthsvsldnokchq.supabase.co:5432/postgres"
    ]

    for url in urls:
        print(f"\n--- Testing connection to: {url} ---")
        try:
            # Use connect_args to specify timeout
            engine = create_engine(url, connect_args={'connect_timeout': 5})
            with engine.connect() as conn:
                print("Successfully connected to the database!")

            # Try to query something
            with Session(engine) as session:
                users = session.query(User).limit(1).all()
                print(f"Query successful! Found {len(users)} users.")

            print(f"SUCCESS with {url}")
            return # Stop if successful

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_connection()
