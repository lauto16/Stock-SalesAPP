import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";


/* Verifies if the user haves the needed permissions to enter a page wrapped in this component */

const RequirePermission = ({ permission, children }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.permissions?.includes(permission)) {
            navigate("/", { replace: true });
        }
    }, [user, permission, navigate]);

    if (!user) return null;

    return user.permissions.includes(permission) ? children : null;
};

export default RequirePermission;