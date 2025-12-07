import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import { fetchOffers } from '../../services/axios.services.js'
import { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext.jsx";

export default function Offers() {

    const { user } = useUser();
    const [offers, setOffers] = useState([]);
    const [count, setCount] = useState(0);

    //TODO: when the whole page is finished uncomment all setLoading lines here, including the ones inside fetchOffers()
    useEffect(() => {
        const loadOffers = async () => {
            const { results, count } = await fetchOffers({
                page: 1,
                //setLoading,
                token: user.token,
            });

            setOffers(results.offers);
            setCount(count);
        };

        loadOffers();
    }, []);

    return (
        <RequirePermission permission="access_offers">
            {offers.map(o => (
                <div key={o.name}>{o.name}</div>
            ))}
        </RequirePermission>
    )
}