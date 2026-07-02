import {useEffect, useState} from "react";
import styles from "./FilterModal.module.css";
import type {Filters} from "../../pages/Main.tsx";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: Filters;
    onApplyFilters: (filters: Filters) => void;
}

const FilterModal = ({ isOpen, onClose, currentFilters, onApplyFilters }: FilterModalProps) => {
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

    useEffect(() => {
        if (isOpen) setLocalFilters(currentFilters);
    }, [isOpen, currentFilters]);

    const handleStatusChange = (status: string) => {
        setLocalFilters(prev => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
    };

    const handlePriorityChange = (priority: string) => {
        setLocalFilters(prev => ({
            ...prev,
            priority: prev.priority.includes(priority)
                ? prev.priority.filter(p => p !== priority)
                : [...prev.priority, priority]
        }));
    };

    const handleSortChange = (sortBy: Filters['sortBy']) => {
        setLocalFilters(prev => ({ ...prev, sortBy }));
    };

    const handleSubmit = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: Filters = {
            searchQuery: '',
            status: [],
            priority: [],
            sortBy: 'created_desc',
        };
        setLocalFilters(resetFilters);
        onApplyFilters(resetFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Фильтры и сортировка</h2>

                <div className={styles.section}>
                    <h3>Статус</h3>
                    <label><input type="checkbox" checked={localFilters.status.includes('new')} onChange={() => handleStatusChange('new')} /> Новая</label>
                    <label><input type="checkbox" checked={localFilters.status.includes('in_progress')} onChange={() => handleStatusChange('in_progress')} /> В работе</label>
                    <label><input type="checkbox" checked={localFilters.status.includes('done')} onChange={() => handleStatusChange('done')} /> Завершена</label>
                </div>

                <div className={styles.section}>
                    <h3>Приоритет</h3>
                    <label><input type="checkbox" checked={localFilters.priority.includes('high')} onChange={() => handlePriorityChange('high')} /> Высокий</label>
                    <label><input type="checkbox" checked={localFilters.priority.includes('normal')} onChange={() => handlePriorityChange('normal')} /> Средний</label>
                    <label><input type="checkbox" checked={localFilters.priority.includes('low')} onChange={() => handlePriorityChange('low')} /> Низкий</label>
                </div>

                <div className={styles.section}>
                    <h3>Сортировка</h3>
                    <select value={localFilters.sortBy} onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])} className={styles.select}>
                        <option value="created_desc">По дате создания (новые сверху)</option>
                        <option value="created_asc">По дате создания (старые сверху)</option>
                        <option value="priority_desc">По приоритету (высокий сверху)</option>
                        <option value="priority_asc">По приоритету (низкий сверху)</option>
                    </select>
                </div>

                <div className={styles.buttons}>
                    <button onClick={handleReset} className={styles.btnReset}>Сбросить</button>
                    <button onClick={onClose} className={styles.btnCancel}>Отмена</button>
                    <button onClick={handleSubmit} className={styles.btnSubmit}>Применить</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;