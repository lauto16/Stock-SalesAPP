import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import { fetchOffers, addOffer, updateOffer } from '../../services/axios.services.js'
import { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext.jsx";
import Header from '../crud/Header.jsx';
import Table from '../crud/Table.jsx';
import Pagination from '../inventory/Pagination.jsx';
import AddOfferContent from './forms/AddOfferContent.jsx';
import InfoOfferContent from './forms/InfoOfferContent.jsx';

export default function Offers() {

    const { user } = useUser();
    const [offers, setOffers] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false);
    const PAGE_SIZE = 10;

    const columns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "percentage", key: "percentage", label: 'Porcentaje Descuento' },
        { className: "end_date", key: "end_date", label: 'Finaliza' },
        { className: "created_at", key: "created_at", label: 'Creada' },
    ];

    //selectedItemsColums
    const importantColumns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "percentage", key: "percentage", label: 'Porcentaje Descuento' },
        { className: "end_date", key: "end_date", label: 'Finaliza' },
    ];
    const formatDate = (offers) => {
        //refactors date to dd-mm-yyyy format
        return offers.map((offer) => {
            return {
                ...offer,

                created_at: new Date(offer.created_at).toLocaleDateString().replace(/\//g, '-'),
            };
        });
    };
    useEffect(() => {
        const loadOffers = async () => {
            const { results, count } = await fetchOffers({
                page: 1,
                setLoading,
                token: user.token,
            });
            const offersData = formatDate(results.offers);
            setOffers(offersData);

            setCount(count);
            setTotalPages(Math.ceil(count / PAGE_SIZE));
            setLoading(false);
        };

        loadOffers();
    }, [currentPage]);
    useEffect(() => {
        if (selectedItems.size !== 0) {
            setIsSomethingSelected(true)
        } else {
            setIsSomethingSelected(false)
        }
    })

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }

    };

    return (
        <RequirePermission permission="access_offers">
            <div className="d-flex justify-content-center mt-5">
                <div className="container">
                    <div className="table-container-providers">

                        <Header
                            title={"OFERTAS"}
                            isSomethingSelected={isSomethingSelected}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            user={user}
                            items={offers}
                            // deleteItem={deleteProviderById}
                            selectedItemsColumns={importantColumns}
                            reloadPageOne={() => setCurrentPage(1)}
                            onSubmitAddItem={addOffer}
                            onSubmitEditItem={updateOffer}
                            titleAddItem={'Añadir una nueva oferta'}
                            AddItemcontent={AddOfferContent}
                            InfoFormContent={InfoOfferContent}
                            titleInfoForm={'Informacion de la oferta (editar)'}
                        />

                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                        <Table items={offers}
                            columns={columns}
                            loading={loading}
                            setLoading={setLoading}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            pkName={'name'}
                        />

                    </div>
                </div>
            </div>
        </RequirePermission>
    )
}