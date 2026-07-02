import * as React from "react";
import {useState} from "react";
import styles from "./CreateTaskModal.module.css";

export interface CreateTaskPayload {
    title: string;
    description: string | null;
    priority: 'low' | 'normal' | 'high';
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: (payload: CreateTaskPayload) => void;
}

const CreateTaskModal = ({isOpen, onClose, onTaskCreated}: CreateTaskModalProps) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "normal" as 'low' | 'normal' | 'high',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onTaskCreated({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            priority: formData.priority,
        });

        onClose();
        setFormData({title: "", description: "", priority: "normal"});
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Создать новую заявку</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Название</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            minLength={3}
                            maxLength={120}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className={styles.textarea}
                            maxLength={1000}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Приоритет</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'normal' | 'high'})}
                            className={styles.select}
                        >
                            <option value="low">Низкий</option>
                            <option value="normal">Средний</option>
                            <option value="high">Высокий</option>
                        </select>
                    </div>

                    <div className={styles.buttons}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>
                            Отмена
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
