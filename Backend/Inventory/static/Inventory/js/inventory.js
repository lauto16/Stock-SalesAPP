const salesButton = document.getElementById("btn-sales");

function redirectTo(url) {
  window.location.href = url;
}

salesButton.addEventListener("click", () => {
  redirectTo("/sales");
});
