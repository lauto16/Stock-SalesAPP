import { useForm } from "react-hook-form";
import { useNotifications } from "../../../context/NotificationSystem";
import { useUser } from "../../../context/UserContext";

export function useAddItemForm({ onSubmitHandler, handleClose, reload = () => { } }) {
  const { user } = useUser();
  const token = user?.token;
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
    setValue
  } = useForm({ mode: "onSubmit" });

  const { addNotification } = useNotifications();
  const handleBeforeClose = (type, message) => {
    handleClose()
    reset()
    addNotification(type, message)
    reload();
    handleClose()

  };

  const onSubmit = async (data) => {
    if (!data) return;

    const response = await onSubmitHandler(data, token);
    console.log(response);

    if (response.success) {
      handleBeforeClose("success", response.success_message);
    } else {
      handleBeforeClose("error", response.error);
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
    setValue
  };
}