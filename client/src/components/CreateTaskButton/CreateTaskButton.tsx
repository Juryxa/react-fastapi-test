import styles from './CreateTaskButton.module.css'

interface CreateTaskButtonProps {
    onClick: () => void;
}

const CreateTaskButton = ({ onClick }: CreateTaskButtonProps) => {
    return (
        <button onClick={onClick} className={styles.createTaskButton}>
            Создать заявку
        </button>
    );
};

export default CreateTaskButton;