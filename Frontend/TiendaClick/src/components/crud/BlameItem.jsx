export default function BlameItem({ onClickItem, item, columns, selectedItems = new Map(), setSelectedItems = () => { }, pkName = 'code' }) {
    const pkValue = item[pkName]
    const isSelected = selectedItems.has(pkValue);
    const classStockNull = item.stock === 0 ? 'text-danger' : '';

    return (
        <tr onClick={() => {onClickItem(item)}} className={isSelected ? 'selected-product' : ''}>
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