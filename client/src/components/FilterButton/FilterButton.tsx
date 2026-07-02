import styles from './FilterButton.module.css'

interface FilterButtonProps {
    onClick?: () => void;
}

const FilterButton = ({ onClick }: FilterButtonProps) => {
    return (
        <button
            className={styles.filterButton}
            onClick={onClick}
        >
            Фильтры
        </button>
    );
};

export default FilterButton;