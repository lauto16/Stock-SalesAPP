import { useState } from "react";

export default function useReload() {
    const [reload, setReload] = useState(false);
    const reloadHandler = () => {
        setReload(!reload);
    }
    return { reload, reloadHandler };
}