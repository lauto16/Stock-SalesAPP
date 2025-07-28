export default function Search({ value, onChange, onSearch }) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    return (
        <div className="input-group w-100">
            <input
                type="text"
                placeholder="Buscar..."
                className="form-control search-input"
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />
            <button className="btn btn-outline-secondary" onClick={onSearch}>
                Buscar
            </button>
        </div>
    );
}
