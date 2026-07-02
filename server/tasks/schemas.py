from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Status(str, Enum):
    new = 'new'
    in_progress = 'in_progress'
    done = 'done'


class Priority(str, Enum):
    low = 'low'
    normal = 'normal'
    high = 'high'


class SortBy(str, Enum):
    created_at = 'created_at'
    priority = 'priority'


class SortOrder(str, Enum):
    asc = 'asc'
    desc = 'desc'


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=120, examples=['Заголовок к заявке'])
    description: Optional[str] = Field(default=None, max_length=1000, examples=['Описание к заявке'])
    priority: Priority = Field(default=Priority.normal, examples=[Priority.normal])


class TaskCreate(TaskBase):
    """Тело запроса на создание заявки. id/status/даты клиент не передаёт."""
    pass


class TaskStatusUpdate(BaseModel):
    """Тело запроса на смену статуса."""
    status: Status


class TaskResponse(TaskBase):
    id: int
    status: Status
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedTasks(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
    pages: int
