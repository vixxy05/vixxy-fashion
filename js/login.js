(function () {
  const ADMIN = {
    email: "admin@vixxy.com",
    password: "Admin@2026",
  };

  const form = document.querySelector(".auth-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = String(form.email?.value || "").trim().toLowerCase();
    const password = String(form.password?.value || "");

    if (email === ADMIN.email && password === ADMIN.password) {
      sessionStorage.setItem(
        "vixxy_admin",
        JSON.stringify({
          email,
          name: "Admin VIXXY",
          role: "admin",
          loginAt: Date.now(),
        })
      );
      window.location.href = "admin/index.html";
      return;
    }

    window.location.href = "index.html";
  });
})();
