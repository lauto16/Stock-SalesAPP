const btnBack = document.getElementById("btn-back");
const roles = document.querySelectorAll(".role");
const submitFormBtn = document.getElementById("submit-form");
const modal = new bootstrap.Modal(document.getElementById("pinModal"));
const pinInputs = document.querySelectorAll(".pin-digit");
const modalIcon = document.getElementById("modalIcon");
const errorMsg = document.getElementById("errorMsg");
const btnCancelPin = document.getElementById("btnCancelPin");

let selectedRole = null;
let pinValue = "";

// Mapa rol -> icon bootstrap
const roleIcons = {
    salesperson: "bi-person-badge-fill",
    stocker: "bi-person-gear",
    administrator: "bi-person-lock",
};

// Mapa rol -> URL redirect
const roleRedirects = {
    salesperson: "/sales/",
    stocker: "/inventary/",
    administrator: "/dashboard/",
};

function resetPinInputs() {
    pinInputs.forEach((input) => {
        input.value = "";
    });
    pinInputs[0].focus();
    errorMsg.style.display = "none";
    pinValue = "";
}

function selectRole(role) {
    selectedRole = role;
    modalIcon.className = "bi " + roleIcons[role];
    resetPinInputs();
    modal.show();
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

function submitPin() {
    const correctPin = 0 //hacer fetch aca
    if (pinValue === correctPin) {
        errorMsg.style.display = "none";
        modal.hide();
        window.location.href = roleRedirects[selectedRole] || "/";
    } else {
        errorMsg.style.display = "block";
        resetPinInputs();
    }
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

btnCancelPin.addEventListener("click", () => {
    modal.hide();
    selectedRole = null;
    roles.forEach((r) => r.classList.remove("selected"));
});

