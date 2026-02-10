import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roles, children }) => {
    const role = useSelector(state => state.userDetails?.role);

    if (!roles?.includes(role)) {
        return <Navigate to="/unauthorized-access" replace />;
    }

    return children;
};

export default ProtectedRoute;
