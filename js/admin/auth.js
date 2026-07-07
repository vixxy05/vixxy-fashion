(function () {
  const raw = sessionStorage.getItem("vixxy_admin");
  if (!raw) {
    window.location.href = "../login.html";
    return;
  }

  try {
    window.VIXXY_ADMIN = JSON.parse(raw);
  } catch {
    sessionStorage.removeItem("vixxy_admin");
    window.location.href = "../login.html";
  }
})();
