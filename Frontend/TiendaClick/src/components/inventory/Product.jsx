import { useState } from "react"

export default function Product({ item, columns, selectedItems = new Map(), setSelectedItems }) {
    const isSelected = selectedItems.has(item.code);
    // if stock is 0, add class text-danger
    const classStockNull = item.stock === 0 ? 'text-danger' : '';

    const toggleSelection = () => {
        const updated = new Map(selectedItems);
        if (updated.has(item.code)) {
            updated.delete(item.code);
        } else {
            updated.set(item.code, item);
        }
        setSelectedItems(updated);
    };
    return (
        <tr onClick={toggleSelection} className={isSelected ? 'selected-product' : ''}>
            {columns.map((col, colIndex) => (
                <td key={colIndex} className={`col-${col.className} ${classStockNull}`}>
                    {item[col.key]}
                </td>
            ))}
        </tr>

    )
}