import { useState } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext.jsx"
import { fetchSalesAverageValueStatsByPeriod } from "../../services/axios.services.js";


export default function SalesStatsButtons() {
    const [result, setResult] = useState(null);
    const {user} = useUser()

    const fetchStat = async (period) => {
        try {
            const res = await fetchSalesAverageValueStatsByPeriod(user.token, period);
            setResult(res.data);
        } catch (err) {
            console.error(err);
            setResult({ error: "Error fetching data" });
        }
    };


    const periods = ["day", "week", "month", "year", "all"];


    return (
        <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold">Sales Stats</h1>


            <div className="grid grid-cols-2 gap-3">
                {periods.map((p) => (
                    <button
                        key={p}
                        onClick={() => fetchStat(p)}
                        className="p-2 bg-gray-200 rounded-xl shadow hover:bg-gray-300 transition"
                    >
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>


            <pre className="bg-black text-white p-3 rounded-xl text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}