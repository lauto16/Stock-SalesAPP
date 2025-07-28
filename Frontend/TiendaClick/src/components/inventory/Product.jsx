import { useState } from "react"

export default function Product({ item, columns, selectedItems = new Map(), setSelectedItems }) {
    const isSelected = selectedItems.has(item.code);

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
                <td key={colIndex} className={`col-${col.className}`}>
                    {item[col.key]}
                </td>
            ))}
        </tr>

    )
}