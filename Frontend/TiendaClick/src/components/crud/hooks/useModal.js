import { useState } from "react";

export function useModal() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [show, setShow] = useState(false);

    const openModal = (title, message) => {
        setTitle(title);
        setMessage(message);
        setShow(true);
    };

    const closeModal = () => {
        setShow(false);
        setTitle("");
        setMessage("");
    };

    return {
        show,
        title: title,
        message: message,
        openModal,
        closeModal,
        setShow,
    };
}