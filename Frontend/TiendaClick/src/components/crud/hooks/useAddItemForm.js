import { useForm } from "react-hook-form";
import { useNotifications } from "../../../context/NotificationSystem";
import { useUser } from "../../../context/UserContext";
export function useAddItemForm({ onSubmitHandler, handleClose = () => { }, reloadPageOne }) {
    const { user } = useUser();
    const token = user?.token;
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors }
    } = useForm({ mode: "onSubmit" });

    const { addNotification } = useNotifications();
    const handleBeforeClose = (type, message, handleClose) => {
        handleClose();
        addNotification(type, message);
    };

    const onSubmit = async (data) => {
        if (!data) return;
        reloadPageOne()
        reset(data)
        try {
            await onSubmitHandler(data, token);
            handleBeforeClose("success", "Item agregado con éxito", handleClose);
        } catch (err) {
            console.log(err)
            handleBeforeClose("error", "Error al cargar el item", handleClose);
        }

    };

    return {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        errors,
        onSubmit,
    };
}