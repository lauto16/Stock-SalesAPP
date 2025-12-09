export default function Item({ item, columns, selectedItems = new Map(), setSelectedItems = () => { }, pkName = 'code' }) {
    const pkValue = item[pkName]
    const isSelected = selectedItems.has(pkValue);
    const classStockNull = item.stock === 0 ? 'text-danger' : '';
    const toggleSelection = () => {
        const updated = new Map(selectedItems);
        if (updated.has(pkValue)) {
            updated.delete(pkValue);

        } else {
            updated.set(pkValue, item);
        }
        setSelectedItems(updated);
    };
    return (
        <tr onClick={toggleSelection} className={isSelected ? 'selected-product' : ''}>
            {columns.map((col, colIndex) => {
                const value = item[col.key];
                const displayValue = typeof value === 'number' ? value.toFixed(2) : value;

                return (
                    <td key={colIndex} className={`col-${col.className} ${classStockNull}`}>
                        {displayValue}
                    </td>
                );
            })}
        </tr>

    )
}