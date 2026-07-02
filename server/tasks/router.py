import math
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import case, or_

from server.tasks import models, schemas
from server.tasks.dependencies import get_db

router = APIRouter(
    prefix='/api/tasks',
    tags=["tasks"],
    responses={404: {"description": "Not found"}},
)


@router.post('/', response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Tasks(
        title=payload.title,
        description=payload.description,
        status=schemas.Status.new.value,
        priority=payload.priority.value,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get('/', response_model=schemas.PaginatedTasks, status_code=status.HTTP_200_OK)
def list_tasks(
        db: Session = Depends(get_db),
        status_filter: Optional[List[schemas.Status]] = Query(default=None, alias='status'),
        priority_filter: Optional[List[schemas.Priority]] = Query(default=None, alias='priority'),
        search: Optional[str] = Query(default=None, description='Поиск по title и description'),
        sort_by: schemas.SortBy = Query(default=schemas.SortBy.created_at),
        order: schemas.SortOrder = Query(default=schemas.SortOrder.desc),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=10, ge=1, le=100),
):
    query = db.query(models.Tasks)

    if status_filter:
        query = query.filter(models.Tasks.status.in_([s.value for s in status_filter]))
    if priority_filter:
        query = query.filter(models.Tasks.priority.in_([p.value for p in priority_filter]))
    if search:
        like = f'%{search}%'
        query = query.filter(or_(models.Tasks.title.ilike(like), models.Tasks.description.ilike(like)))

    total = query.count()

    if sort_by == schemas.SortBy.priority:
        priority_rank = case(
            {'low': 0, 'normal': 1, 'high': 2},
            value=models.Tasks.priority,
        )
        sort_column = priority_rank
    else:
        sort_column = models.Tasks.created_at

    query = query.order_by(sort_column.desc() if order == schemas.SortOrder.desc else sort_column.asc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = math.ceil(total / page_size) if total else 0

    return schemas.PaginatedTasks(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get('/{task_id}', response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Tasks).filter(models.Tasks.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Заявка не найдена')
    return task


@router.patch('/{task_id}/status', response_model=schemas.TaskResponse)
def update_task_status(task_id: int, payload: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Tasks).filter(models.Tasks.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Заявка не найдена')

    if task.status == schemas.Status.done.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='Заявка в статусе done не может быть изменена',
        )

    task.status = payload.status.value
    db.commit()
    db.refresh(task)
    return task


@router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Tasks).filter(models.Tasks.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Заявка не найдена')

    if task.status == schemas.Status.done.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='Заявка в статусе done не может быть удалена',
        )

    db.delete(task)
    db.commit()
    return None
