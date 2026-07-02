import * as React from "react";
import {useEffect, useState} from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Поиск по названию и описанию..."
                value={localValue}
                onChange={handleChange}
                style={{ padding: "10px", width: "50vw", borderRadius: "6px", border: "1px solid #ccc" }}
            />
        </div>
    );
};

export default SearchBar;