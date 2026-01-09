import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import "../../css/auth.css";
import Form from "react-bootstrap/Form";
import SideBar from "../sideNav/SideBar";
import Nav from '../sideNav/Nav.jsx'
import SideBarBrand from "../sideNav/SideBarBrand";
import DashboardHeader from "../dashboard/DashboardHeader";
import { usePin } from "../../context/PinContext.jsx";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import { useUser } from "../../context/UserContext";
import {updateAskForPin, getAskForPin} from "../../services/axios.services.js"

export default function DeleteUser() {
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);
    const { pinVerified, checking, pinDisabled, setPinDisabled } = usePin();
    const { user, updateUserData } = useUser();
    
    const onChangeAskForPin =  (e) =>{
        
        const response = updateAskForPin(pinDisabled, user.token)
        setPinDisabled(e.target.checked)
    }

    useEffect(()=>{
        const getPinState = async () => {
            const response = await getAskForPin(user.token)
            console.log(response);
            
            setPinDisabled(!response.askForPin)
        }
        getPinState()
        updateUserData()
    }, [])

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
                                <Form className="d-flex align-items-center justify-content-between">
                                    <span style={{userSelect: 'none'}} className="fw-semibold">No pedir PIN</span>
                                    <Form.Check
                                        type="switch"
                                        id="pin-switch"
                                        label=""
                                        checked={pinDisabled}
                                        onChange={(e) => onChangeAskForPin(e)}
                                    />
                                </Form>
                            </Card.Body>
                        </Card>
                    </section>
                </main>
            </div>
        </RequirePermission >
    );
}