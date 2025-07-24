const roles = document.querySelectorAll(".role");
const submitFormBtn = document.getElementById("submit-form");
const modal = new bootstrap.Modal(document.getElementById("pinModal"));
const pinInputs = document.querySelectorAll(".pin-digit");
const modalIcon = document.getElementById("modalIcon");
const errorMsg = document.getElementById("errorMsg");
const btnCancelPin = document.getElementById("btnCancelPin");
const pinModal = document.getElementById("pinModal");

let selectedRole = null;
let pinValue = "";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const roleRedirects = {
  salesperson: "sales",
  stocker: "inventory",
  administrator: "dashboard",
};

const roleIcons = {
  salesperson: "bi-person-badge-fill",
  stocker: "bi-person-gear",
  administrator: "bi-person-lock",
};

function resetPinInputs() {
  pinInputs.forEach((input) => {
    input.value = "";
  });
  pinInputs[0].focus();
  errorMsg.style.display = "none";
  pinValue = "";
}

function submitPin() {
  fetch("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      user_pin: pinValue,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const newPath = roleRedirects[data.role] || "/";
        const newUrl = window.location.origin + '/' + newPath;
        window.location.replace(newUrl);

      } else {
        resetPinInputs();
        errorHandler("El pin es incorrecto");
      }
    })
    .catch((err) => {
      console.error("Error al verificar el pin:", err);
      errorHandler("Ocurrió un error inesperado");
    });
}

function errorHandler(message) {
  const toastElement = document.getElementById("liveToast");
  toastElement.querySelector(".toast-body").textContent = message;
  toastElement.classList.remove("text-bg-success");
  toastElement.classList.add("text-bg-danger");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function successHandler(message) {
  const toastElement = document.getElementById("liveToast");
  toastElement.querySelector(".toast-body").textContent = message;
  toastElement.classList.add("text-bg-success");
  toastElement.classList.remove("text-bg-danger");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

pinInputs.forEach((input, idx) => {
  input.addEventListener("input", (e) => {
    const val = e.target.value;
    if (!/^\d$/.test(val)) {
      e.target.value = "";
      return;
    }
    if (idx < pinInputs.length - 1) {
      pinInputs[idx + 1].focus();
    } else {
      pinValue = Array.from(pinInputs)
        .map((i) => i.value)
        .join("");
      submitPin();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && idx > 0) {
      pinInputs[idx - 1].focus();
    }
  });
});

pinModal.addEventListener("shown.bs.modal", () => {
  if (pinInputs.length > 0) {
    pinInputs[0].focus();
  }
});

modal.show()
pinInputs[0].focus();