import { useForm } from "react-hook-form";
import { useNotifications } from "../../../context/NotificationSystem";
import { useUser } from "../../../context/UserContext";
import { loginUser } from "../../../services/axios.services";
export function useAddItemForm({ onSubmitHandler, handleClose = () => { }, reloadWithBounce }) {
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
        handleClose()
        reset()
        // TODO: This sucks, we should find a way to do better
        if (message.includes('400')){
            addNotification('error', 'Ya existe un producto con este código');
        }
        else{
            addNotification(type, message);
        }
        
        
    };

    const onSubmit = async (data) => {
        if (!data) return;
        reloadWithBounce()
        reset(data)
        try {
            await onSubmitHandler(data, token);
            handleBeforeClose("success", "Item agregado con éxito", handleClose);
        } catch (err) {
            console.log(err)
            handleBeforeClose("error", err.message, handleClose);
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