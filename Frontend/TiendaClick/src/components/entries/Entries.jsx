import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";

export default function Entries() {
    return (
        <RequirePermission permission="access_inventory">
            <div className="d-flex justify-content-center mt-5">
                <div className="container container-modified">
                    <Header
                        notModifyItem={true}
                        title={"INGRESOS DE STOCK"}
                        isSomethingSelected={isSomethingSelected}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        user={user}
                        items={items}
                        deleteItem={deleteSaleById}
                        isSale={true}
                        reloadPageOne={reloadPageOne}
                        titleAddItem={"Añadir nuevo ingreso"}
                        AddItemcontent={AddSaleContent}
                        onSubmitAddItem={addSale}
                        titleInfoForm={"Informacion del ingreso"}
                        onSubmitEditItem={() => { }}
                        InfoFormContent={InfoFormContent}
                    />

                    <div className="table-container">
                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                            <div className="search-wrapper">
                                <Search
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onSearch={() => handleSearchSubmit(searchInput)}
                                />
                            </div>
                        </div>

                        <Table
                            items={items}
                            columns={columns}
                            loading={loading}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            setIsSomethingSelected={setIsSomethingSelected}
                            pkName={"id"}
                        />

                        <button
                            className="btn btn-outline-secondary clear-search-results-button"
                            onClick={clearSearch}
                        >
                            Limpiar resultados de búsqueda
                        </button>
                    </div>
                </div>
            </div>
        </RequirePermission>
    );
}