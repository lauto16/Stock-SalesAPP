import { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import "../../css/auth.css";
import SideBar from "../sideNav/SideBar";
import SideBarBrand from "../sideNav/SideBarBrand";
import DashboardHeader from "../dashboard/DashboardHeader";
import { usePin } from "../../context/PinContext.jsx";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import { useUser } from "../../context/UserContext";

import {
    updateAskForPin,
    getAskForPin
} from "../../services/axios.services.pin_manager.js";

import {
    getAreUsersAllowedToDecideStockDecrease,
    updateAreUsersAllowedToDecideStockDecrease
} from "../../services/axios.services.config.js";

export default function DeleteUser() {

    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);
    const { pinDisabled, setPinDisabled } = usePin();
    const { user, updateUserData } = useUser();

    const [areUsersAllowedToDecideStockDecrease, setAreUsersAllowedToDecideStockDecrease] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {

            const pinResponse = await getAskForPin(user.token);
            setPinDisabled(pinResponse.askForPin);

            const stockResponse = await getAreUsersAllowedToDecideStockDecrease(user.token);
            setAreUsersAllowedToDecideStockDecrease(stockResponse.areUsersAllowedValue);

            updateUserData();
        };

        loadConfig();
    }, []);


    const onChangeAskForPin = async (e) => {
        const newValue = (e.target.checked);

        setPinDisabled(newValue);
        await updateAskForPin(newValue, user.token);
    };

    const onChangeStockDecision = async (e) => {
        const newValue = e.target.checked;

        setAreUsersAllowedToDecideStockDecrease(newValue);
        await updateAreUsersAllowedToDecideStockDecrease(newValue, user.token);
    };

    return (
        <RequirePermission permission="access_dashboard">
            <div className={`app-wrapper ${!showSidebar ? "no-sidebar" : ""}`}>
                <div className="header-container text-center mt-2">
                    <DashboardHeader title={"CONFIGURACIÓN"} isDashboard={false} />
                </div>

                {showSidebar && <SideBar />}

                <main className="content">
                    <section className="app-content container-fluid d-flex justify-content-center align-items-center flex-column">
                        <Card className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>

                            <Card.Header className="auth-card-header text-center">
                                <SideBarBrand />
                            </Card.Header>

                            <Card.Body className="auth-card-body">

                                {/* PIN */}
                                <Form className="d-flex align-items-center justify-content-between">
                                    <span className="fw-semibold" style={{ userSelect: 'none' }}>
                                        Pedir pin
                                    </span>

                                    <Form.Check
                                        type="switch"
                                        checked={pinDisabled}
                                        onChange={onChangeAskForPin}
                                    />
                                </Form>

                                <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                                    <i className="bi bi-info-circle-fill"></i>
                                    <span>
                                        En caso de desactivarse, se te pedirá una última vez
                                    </span>
                                </div>

                                <br />

                                <Form className="d-flex align-items-center justify-content-between">
                                    <span className="fw-semibold" style={{ userSelect: 'none' }}>
                                        Permitir a los usuarios decidir si la disminución de stock genera pérdidas
                                    </span>

                                    <Form.Check
                                        type="switch"
                                        checked={areUsersAllowedToDecideStockDecrease}
                                        onChange={onChangeStockDecision}
                                    />
                                </Form>

                            </Card.Body>
                        </Card>
                    </section>
                </main>
            </div>
        </RequirePermission>
    );
}
