import {useState} from "react";
import type {ChangeEvent} from "react";
import type {TaskInterface} from "../../http/interfaces/TaskInterface.ts";
import styles from "./Task.module.css";
import {useAuth} from "../../providers/AuthContext.tsx";
import TaskService from "../../http/services/TaskService.ts";

interface TaskProps {
    task: TaskInterface;
    onDeleted: (id: number) => void;
    onStatusChanged: (id: number, updatedTask: TaskInterface) => void;
}

const statusOptions: { value: TaskInterface['status']; label: string }[] = [
    {value: 'new', label: 'Новая'},
    {value: 'in_progress', label: 'В работе'},
    {value: 'done', label: 'Завершена'},
];

const Task = ({task, onDeleted, onStatusChanged}: TaskProps) => {
    const {isAdmin} = useAuth();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const isDone = task.status === 'done';

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case "high": return styles.priorityHigh;
            case "normal": return styles.priorityNormal;
            case "low": return styles.priorityLow;
            default: return "";
        }
    };

    const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TaskInterface['status'];
        if (newStatus === task.status) return;

        setIsUpdatingStatus(true);
        setActionError(null);
        try {
            const {data} = await TaskService.updateTaskStatus(task.id, newStatus);
            onStatusChanged(task.id, data);
        } catch (err: any) {
            setActionError(err?.response?.data?.detail ?? 'Не удалось изменить статус');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setActionError(null);
        try {
            await TaskService.deleteTask(task.id);
            onDeleted(task.id);
        } catch (err: any) {
            setActionError(err?.response?.data?.detail ?? 'Не удалось удалить заявку');
            setIsDeleting(false);
        }
    };

    return (
        <li className={styles.taskCard}>
            <div className={styles.taskHeader}>
                <h3 className={styles.taskTitle}>{task.title}</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span className={`${styles.priorityBadge} ${getPriorityClass(task.priority)}`}>
                        {task.priority === "high" && "🔴"}
                        {task.priority === "normal" && "🟠"}
                        {task.priority === "low" && "🟢"}
                        {task.priority.toUpperCase()}
                    </span>

                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            disabled={isDone || isDeleting}
                            title={isDone ? 'Завершённые заявки нельзя удалить' : 'Удалить заявку'}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: isDone || isDeleting ? 'not-allowed' : 'pointer',
                                opacity: isDone || isDeleting ? 0.4 : 1,
                                fontSize: '16px',
                            }}
                        >
                            🗑
                        </button>
                    )}
                </div>
            </div>

            {task.description && (
                <p className={styles.taskDescription}>
                    {task.description}
                </p>
            )}

            <div className={styles.taskFooter}>
                <span>
                    Статус:{' '}
                    <select
                        value={task.status}
                        onChange={handleStatusChange}
                        disabled={isDone || isUpdatingStatus}
                        title={isDone ? 'Завершённую заявку нельзя перевести в другой статус' : undefined}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </span>

                <span>
                    {new Intl.DateTimeFormat('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(new Date(task.created_at))}
                </span>
            </div>

            {actionError && (
                <p style={{color: '#c0392b', fontSize: '13px', margin: '8px 0 0'}}>{actionError}</p>
            )}
        </li>
    );
};

export default Task;
