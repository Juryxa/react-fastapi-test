import axios from "axios";
import SearchBar from "../components/SearchBar/SearchBar.tsx";
import FilterButton from "../components/FilterButton/FilterButton.tsx";
import CreateTaskButton from "../components/CreateTaskButton/CreateTaskButton.tsx";
import AuthButton from "../components/AuthButton/AuthButton.tsx";
import styles from './Main.module.css'
import TaskList from "../components/Task/TaskList.tsx";
import {useEffect, useState} from "react";
import CreateTaskModal from "../components/CreateTaskModal/CreateTaskModal.tsx";
import type {CreateTaskPayload} from "../components/CreateTaskModal/CreateTaskModal.tsx";
import FilterModal from "../components/FilterModal/FilterModal.tsx";
import Pagination from "../components/Pagination/Pagination.tsx";
import TaskService from "../http/services/TaskService.ts";
import type {TaskInterface} from "../http/interfaces/TaskInterface.ts";
import {useDebounce} from "../hooks/useDebounce.ts";

export type Filters = {
    searchQuery: string;
    status: string[];
    priority: string[];
    sortBy: 'created_desc' | 'created_asc' | 'priority_desc' | 'priority_asc';
};

const PAGE_SIZE = 10;

function mapSortBy(sortBy: Filters['sortBy']): { sortBy: 'created_at' | 'priority'; order: 'asc' | 'desc' } {
    const [field, order] = sortBy.split('_') as ['created' | 'priority', 'asc' | 'desc'];
    return {
        sortBy: field === 'created' ? 'created_at' : 'priority',
        order,
    };
}

const Main = () => {
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Поиск: инпут обновляется мгновенно (для отзывчивого UI),
    // а запрос на бэк уходит только по debounced-значению (300мс)
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);

    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<Filters['sortBy']>('created_desc');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // При смене поиска/фильтров/сортировки всегда возвращаемся на первую страницу
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, priorityFilter, sortBy]);

    // Загрузка заявок с бэка — единственный источник фильтрации/сортировки/пагинации
    useEffect(() => {
        const controller = new AbortController();

        const fetchTasks = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const {sortBy: sort_by, order} = mapSortBy(sortBy);
                const {data} = await TaskService.getTasks({
                    search: debouncedSearch || undefined,
                    status: statusFilter,
                    priority: priorityFilter,
                    sortBy: sort_by,
                    order,
                    page,
                    pageSize: PAGE_SIZE,
                }, controller.signal);

                setTasks(data.items);
                setTotalPages(data.pages);
                setTotalItems(data.total);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setLoadError('Не удалось загрузить заявки. Попробуйте ещё раз.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
        return () => controller.abort();
    }, [debouncedSearch, statusFilter, priorityFilter, sortBy, page]);


    const handleTaskCreated = async (payload: CreateTaskPayload) => {
        setLoadError(null);
        try {
            const {data: createdTask} = await TaskService.createTask(
                payload.title,
                payload.description,
                payload.priority,
            );
            setTasks(prev => [createdTask, ...prev]);
            setTotalItems(prev => prev + 1);
        } catch {
            setLoadError('Не удалось создать заявку. Попробуйте ещё раз.');
        }
    };

    const handleTaskDeleted = (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setTotalItems(prev => Math.max(0, prev - 1));
    };

    const handleTaskStatusChanged = (id: number, updatedTask: TaskInterface) => {
        setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setSearchInput(newFilters.searchQuery);
        setStatusFilter(newFilters.status);
        setPriorityFilter(newFilters.priority);
        setSortBy(newFilters.sortBy);
    };

    const currentFilters: Filters = {
        searchQuery: searchInput,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
    };

    return (
        <main className={styles.main}>
            <AuthButton/>
            <div className={styles.searchFiltersCreateWrapper}>
                <div className={styles.searchFiltersWrapper}>
                    <SearchBar
                        value={searchInput}
                        onChange={setSearchInput}
                    />
                    <FilterButton onClick={() => setIsFilterModalOpen(true)}/>
                </div>
                <CreateTaskButton onClick={() => setIsCreateTaskModalOpen(true)}/>
            </div>

            {loadError && (
                <p style={{color: '#c0392b', textAlign: 'center', padding: '8px'}}>{loadError}</p>
            )}

            {isLoading ? (
                <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>Загрузка...</p>
            ) : (
                <>
                    <TaskList
                        tasks={tasks}
                        onTaskDeleted={handleTaskDeleted}
                        onTaskStatusChanged={handleTaskStatusChanged}
                    />
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={setPage}
                    />
                </>
            )}

            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                onTaskCreated={handleTaskCreated}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={currentFilters}
                onApplyFilters={handleFiltersChange}
            />
        </main>
    );
};

export default Main;
