import axios from "axios";
import type {TaskInterface, PaginatedTasksResponse} from "../interfaces/TaskInterface.ts";

export const taskURL = 'http://localhost:8000/api/tasks';

const taskApi = axios.create({
    withCredentials: true,
    baseURL: taskURL,
});

export type SortField = 'created_at' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface GetTasksParams {
    search?: string;
    status?: string[];
    priority?: string[];
    sortBy: SortField;
    order: SortOrder;
    page: number;
    pageSize: number;
}

// axios с обычным объектом сериализует массивы как status[]=a&status[]=b,
// а FastAPI (List[...] в Query) ждёт повторяющийся ключ: status=a&status=b.
// Поэтому собираем URLSearchParams вручную через append.
function buildTasksSearchParams(params: GetTasksParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.set('search', params.search);
    params.status?.forEach(s => searchParams.append('status', s));
    params.priority?.forEach(p => searchParams.append('priority', p));
    searchParams.set('sort_by', params.sortBy);
    searchParams.set('order', params.order);
    searchParams.set('page', String(params.page));
    searchParams.set('page_size', String(params.pageSize));

    return searchParams;
}

export default class TaskService {
    static async createTask(title: string, description: string | null, priority: 'low' | 'normal' | 'high') {
        return taskApi.post<TaskInterface>('/', {title, description, priority});
    }

    static async getTasks(params: GetTasksParams, signal?: AbortSignal) {
        return taskApi.get<PaginatedTasksResponse>('/', {
            params: buildTasksSearchParams(params),
            signal,
        });
    }

    static async getTask(taskId: number) {
        return taskApi.get<TaskInterface>(`/${taskId}`);
    }

    static async deleteTask(taskId: number) {
        return taskApi.delete(`/${taskId}`);
    }

    static async updateTaskStatus(taskId: number, status: 'new' | 'in_progress' | 'done') {
        return taskApi.patch<TaskInterface>(`/${taskId}/status`, {status});
    }
}
