# Business Bridge Backend API

FastAPI backend application for Business Bridge marketplace.

## Features

- RESTful API with FastAPI
- PostgreSQL database with SQLAlchemy ORM
- Pydantic validation
- JWT authentication
- Role-based authorization
- Background job processing
- Redis caching
- Comprehensive audit logging

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Tech Stack

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL
- Redis
- Celery (worker)
- JWT authentication
