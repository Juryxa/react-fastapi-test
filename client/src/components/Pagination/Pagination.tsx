interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({page, totalPages, totalItems, onPageChange}: PaginationProps) => {
    if (totalPages <= 1) return null;

    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
        }}>
            <button onClick={() => onPageChange(page - 1)} disabled={!canGoPrev}>
                ← Назад
            </button>
            <span>
                Страница {page} из {totalPages} ({totalItems} заявок)
            </span>
            <button onClick={() => onPageChange(page + 1)} disabled={!canGoNext}>
                Вперёд →
            </button>
        </div>
    );
};

export default Pagination;
