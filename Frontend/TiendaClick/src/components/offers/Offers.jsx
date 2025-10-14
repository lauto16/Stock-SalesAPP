import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'

export default function Offers() {
    return(
        <RequirePermission permission="access_offers">
            <h1>CRUD Ofertas</h1>
        </RequirePermission>
    )
}