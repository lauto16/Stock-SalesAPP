import { useState } from "react";
import { useUser } from "../../context/UserContext.jsx"
import {
    fetchSalesAverageValueStatsByPeriod,
    fetchMostUsedPaymentMethodsStatsByPeriod,
    fetchBestSellingProducts
} from "../../services/axios.services.js";

export default function SalesStatsButtons() {
    const [resultSaleValueStat, setResultSaleValueStat] = useState(null);
    const [resultMostUsedPaymentMethod, setResultMostUsedPaymentMethod] = useState(null);
    const [resultBestSellingProducts, setResultBestSellingProducts] = useState(null);

    const { user } = useUser();

    const fetchSaleValueStat = async (period) => {
        try {
            const res = await fetchSalesAverageValueStatsByPeriod(user.token, period);
            setResultSaleValueStat(res.data);
        } catch (err) {
            console.error(err);
            setResultSaleValueStat({ error: "Error fetching data" });
        }
    };

    const fetchMostUsedPaymentMethod = async (period) => {
        try {
            const res = await fetchMostUsedPaymentMethodsStatsByPeriod(user.token, period);
            setResultMostUsedPaymentMethod(res.data);
        } catch (err) {
            console.error(err);
            setResultMostUsedPaymentMethod({ error: "Error fetching data" });
        }
    };

    const fetchBestSellingProductsStat = async (period) => {
        try {
            const res = await fetchBestSellingProducts(user.token, period, 15);
            setResultBestSellingProducts(res.data);
        } catch (err) {
            console.error(err);
            setResultBestSellingProducts({ error: "Error fetching data" });
        }
    };

    const periods = ["day", "week", "month", "year", "all"];

    return (
        <div>

            {/* Sales average value */}
            <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
                <h1 className="text-xl font-bold">Sales Stats</h1>
                <h5 className="text-xl">Sales average value</h5>

                <div className="grid grid-cols-2 gap-3">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchSaleValueStat(p)}
                            className="p-2 bg-gray-200 rounded-xl shadow hover:bg-gray-300 transition"
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>

                <pre className="bg-black text-white p-3 rounded-xl text-sm whitespace-pre-wrap">
                    {JSON.stringify(resultSaleValueStat, null, 2)}
                </pre>
            </div>

            {/* Most used payment method */}
            <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
                <h5 className="text-xl">Most used payment method</h5>

                <div className="grid grid-cols-2 gap-3">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchMostUsedPaymentMethod(p)}
                            className="p-2 bg-gray-200 rounded-xl shadow hover:bg-gray-300 transition"
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>

                <pre className="bg-black text-white p-3 rounded-xl text-sm whitespace-pre-wrap">
                    {JSON.stringify(resultMostUsedPaymentMethod, null, 2)}
                </pre>
            </div>

            {/* Best selling products */}
            <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
                <h5 className="text-xl">Best selling products (Top 15)</h5>

                <div className="grid grid-cols-2 gap-3">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchBestSellingProductsStat(p)}
                            className="p-2 bg-gray-200 rounded-xl shadow hover:bg-gray-300 transition"
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>

                <pre className="bg-black text-white p-3 rounded-xl text-sm whitespace-pre-wrap">
                    {JSON.stringify(resultBestSellingProducts, null, 2)}
                </pre>
            </div>

        </div>
    );
}