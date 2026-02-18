import { useForm } from "react-hook-form";
import { useNotifications } from "../../../context/NotificationSystem";
import { useUser } from "../../../context/UserContext";

export function useAddItemForm({ onSubmitHandler, handleClose = () => { }, reloadWithBounce = () => { } }) {
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
  const handleBeforeClose = (type, message, handleClose) => {
    handleClose()
    reset()
    addNotification(type, message)
  };

  const onSubmit = async (data) => {
    if (!data) return;
    reloadWithBounce();

    const response = await onSubmitHandler(data, token);

    if (response.success) {
      reset();
      handleBeforeClose("success", response.success_message, handleClose);
    } else {
      handleBeforeClose("error", response.error, handleClose);
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