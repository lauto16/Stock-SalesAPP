const btnBack = document.getElementById("btn-back");
const roles = document.querySelectorAll(".role");
const submitFormBtn = document.getElementById("submit-form");
const modal = new bootstrap.Modal(document.getElementById("pinModal"));
const pinInputs = document.querySelectorAll(".pin-digit");
const modalIcon = document.getElementById("modalIcon");
const errorMsg = document.getElementById("errorMsg");
const btnCancelPin = document.getElementById("btnCancelPin");
const pinModal = document.getElementById("pinModal");

let pinValue = "";

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
      role_name: selectedRole,
      role_pin: pinValue,
    }),
  }).then((res) => {
    if (res.ok && res.success) {
      window.location.href = roleRedirects[selectedRole] || "/";
    } else {
      resetPinInputs();
      errorHandler("El pin es incorrecto");
    }
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

btnBack.addEventListener("click", (e) => {
  e.preventDefault();
  window.history.back();
});

roles.forEach((role) => {
  role.addEventListener("click", () => {
    roles.forEach((r) => r.classList.remove("selected"));
    role.classList.add("selected");
    selectedRole = role.getAttribute("data-value");
    selectRole(selectedRole);
  });
});

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
