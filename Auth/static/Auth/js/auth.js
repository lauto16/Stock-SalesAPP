function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const submitFormButton = document.getElementById('submit-form');

submitFormButton.addEventListener('click', (e) => {
    e.preventDefault()
    username = document.getElementById("username").value.trim();
    password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Por favor, completa usuario y contraseña.");
        return;
    }

    fetch("", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
        .then(res => {
            if (res.ok) {
                window.location.href = "/role_selector/";
            } else {
                alert("Error de autenticación");
            }
        })
        .catch(() => alert("Error en la comunicación con el servidor."));
});