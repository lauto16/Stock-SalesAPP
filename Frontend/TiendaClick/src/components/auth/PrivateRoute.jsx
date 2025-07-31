import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";

function PrivateRoute({ children }) {
    const { user } = useUser();

    if (!user?.isAuthenticated) {
        return <Navigate to="/login/" replace />;
    }

    return children;
}

export default PrivateRoute;