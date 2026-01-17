import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";

export default function Entries() {
    return (
        <RequirePermission permission="access_inventory">
        <h1>CRUD Entries</h1>
        </RequirePermission>
    );
  }