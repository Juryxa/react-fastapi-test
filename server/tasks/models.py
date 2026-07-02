import datetime

from sqlalchemy import Column, Integer, String, DateTime

from server.database import Base


def utcnow() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


class Tasks(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(length=120), nullable=False, index=True)
    description = Column(String(length=1000), nullable=True)
    status = Column(String(length=20), nullable=False, default='new', index=True)
    priority = Column(String(length=20), nullable=False, default='normal', index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

