export const mockSalesStats = {
    sales_data: {
        total_sales_this_day: 10,
        total_money_sales_this_day: 15000,
        total_sales_this_month: 250,
        total_money_sales_this_month: 450000,
        total_sales_this_year: 3000,
        total_money_sales_this_year: 5000000
    }
};

export const mockEmployeeStats = {
    employees_stats: {
        most_selling_employee_this_day: 'Juan Perez',
        most_selling_employee_this_month: 'Maria Garcia',
        most_selling_employee_this_year: 'Carlos Lopez',
        most_selling_employee_historically: 'Ana Martinez'
    }
};

export const mockProductStats = {
    products_data: {
        average_gain_margin_per_product: 45.5
    }
};

export const mockLowStock = [
    { code: 'P001', name: 'Product 1', sell_price: 100, stock: 2 },
    { code: 'P002', name: 'Product 2', sell_price: 200, stock: 1 }
];
