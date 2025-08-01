import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNotifications } from "../../../context/NotificationSystem";

export function useAddItemForm({ onSubmitHandler, handleClose = () => { }, defaultValues = {}, onUseEffect, useEffectDependencies }) {

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm({ defaultValues });

    useEffect(() => {
        onUseEffect?.()
    }, useEffectDependencies || []);

    const { addNotification } = useNotifications();
    const handleBeforeClose = (type, message, handleClose) => {
        handleClose();
        if (type === "success") reset();
        addNotification(type, message);
    };

    const onSubmit = async (data) => {
        const identifier = data.id ?? data.code;
        if (!identifier || !data.name) return;

        try {
            await onSubmitHandler(data);
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