export interface TaskInterface {
    id: number;
    title: string;
    description: string | null;
    status: 'new' | 'in_progress' | 'done';
    priority: 'low' | 'normal' | 'high';
    created_at: string;
    updated_at: string;
}

export interface PaginatedTasksResponse {
    items: TaskInterface[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}
