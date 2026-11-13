import pytest
from app.database.session import Base, engine, SessionLocal
from app.database.init_db import init_db


@pytest.fixture(scope="session", autouse=True)
def prepare_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield
