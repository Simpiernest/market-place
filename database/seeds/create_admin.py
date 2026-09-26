import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add parent directory and apps/api to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "..", "apps", "api"))

from app.models.domain import User, UserRole, UserRoleMapping
from app.core.database import SessionLocal

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@businessbridge.com"
        admin = db.query(User).filter(User.email == email).first()

        if not admin:
            admin = User(
                id=uuid.uuid4(),
                email=email,
                email_verified=True,
                full_name="System Administrator",
                is_active=True,
            )
            db.add(admin)
            db.flush()

            # Map to ADMIN role
            role_map = UserRoleMapping(
                user_id=admin.id,
                role=UserRole.ADMIN
            )
            db.add(role_map)
            db.commit()
            print(f"✓ Admin user created: {email}")
            print(f"  Note: In local development, auth is often mocked or use the same email in Supabase.")
        else:
            print(f"Admin user {email} already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
