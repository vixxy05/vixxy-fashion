(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const fmtMoney = (v) =>
    new Intl.NumberFormat("vi-VN").format(v) + " ₫";

  const statusMap = {
    paid: { label: "Đã thanh toán", cls: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20" },
    shipping: { label: "Đang giao", cls: "bg-sky-500/15 text-sky-400 ring-sky-500/20" },
    pending: { label: "Chờ xử lý", cls: "bg-amber-500/15 text-amber-400 ring-amber-500/20" },
    cancelled: { label: "Đã hủy", cls: "bg-rose-500/15 text-rose-400 ring-rose-500/20" },
  };

  let currentPage = 1;
  const pageSize = 5;
  let loading = false;
  let activeSection = "dashboard";

  const root = document.documentElement;
  const savedTheme = localStorage.getItem("vixxy_admin_theme") || "dark";
  root.classList.toggle("dark", savedTheme === "dark");

  function setLoading(on) {
    loading = on;
    const overlay = $("#loadingOverlay");
    if (overlay) overlay.classList.toggle("hidden", !on);
  }

  function renderStats() {
    const d = window.ADMIN_DATA.stats;
    $("#statRevenue").textContent = fmtMoney(d.revenue);
    $("#statOrders").textContent = d.orders.toLocaleString("vi-VN");
    $("#statUsers").textContent = d.users.toLocaleString("vi-VN");
    $("#statGrowth").textContent = `+${d.growth}%`;
  }

  function renderChart() {
    const wrap = $("#revenueChart");
    if (!wrap) return;
    const data = window.ADMIN_DATA.revenueByMonth;
    const max = Math.max(...data.map((x) => x.value));

    wrap.innerHTML = data
      .map(
        (item) => `
      <div class="flex flex-1 flex-col items-center gap-2">
        <div class="flex h-40 w-full items-end justify-center">
          <div
            class="chart-bar w-full max-w-[28px] rounded-t-lg bg-indigo-500/80 transition-all duration-500 hover:bg-indigo-400"
            style="height:${Math.round((item.value / max) * 100)}%"
            title="${item.month}: ${item.value}M"
          ></div>
        </div>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">${item.month}</span>
      </div>`
      )
      .join("");
  }

  function renderCategories() {
    const html = window.ADMIN_DATA.categories
      .map(
        (c) => `
      <div class="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold">${c.name}</span>
          <span class="text-sm font-bold text-indigo-500">${c.share}%</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-full rounded-full" style="width:${c.share}%;background:${c.color}"></div>
        </div>
      </div>`
      )
      .join("");

    const wrap = $("#categoryList");
    const reports = $("#categoryListReports");
    if (wrap) wrap.innerHTML = html;
    if (reports) reports.innerHTML = html;
  }

  function getFilteredOrders() {
    const q = ($("#searchInput")?.value || "").trim().toLowerCase();
    if (!q) return window.ADMIN_DATA.orders;
    return window.ADMIN_DATA.orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
    );
  }

  function renderOrders() {
    const tbody = $("#ordersBody");
    const empty = $("#ordersEmpty");
    const pagination = $("#pagination");
    if (!tbody) return;

    const list = getFilteredOrders();
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = "";
      empty?.classList.remove("hidden");
      pagination.innerHTML = "";
      return;
    }

    empty?.classList.add("hidden");
    const rows = pageItems
      .map((o) => {
        const st = statusMap[o.status] || statusMap.pending;
        return `
        <tr class="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
          <td class="px-4 py-3 font-medium">${o.id}</td>
          <td class="px-4 py-3">${o.customer}</td>
          <td class="px-4 py-3">${o.product}</td>
          <td class="px-4 py-3">${o.category}</td>
          <td class="px-4 py-3 font-semibold">${fmtMoney(o.total)}</td>
          <td class="px-4 py-3">
            <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${st.cls}">${st.label}</span>
          </td>
          <td class="px-4 py-3 text-slate-500">${o.date}</td>
        </tr>`;
      })
      .join("");

    tbody.innerHTML = rows;
    const clone = $("#ordersBodyClone");
    if (clone) clone.innerHTML = getFilteredOrders().map((o) => {
      const st = statusMap[o.status] || statusMap.pending;
      return `
        <tr class="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
          <td class="px-4 py-3 font-medium">${o.id}</td>
          <td class="px-4 py-3">${o.customer}</td>
          <td class="px-4 py-3">${o.product}</td>
          <td class="px-4 py-3">${o.category}</td>
          <td class="px-4 py-3 font-semibold">${fmtMoney(o.total)}</td>
          <td class="px-4 py-3">
            <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${st.cls}">${st.label}</span>
          </td>
          <td class="px-4 py-3 text-slate-500">${o.date}</td>
        </tr>`;
    }).join("");

    pagination.innerHTML = `
      <button data-page="prev" class="page-btn rounded-lg border px-3 py-1.5 text-sm ${currentPage === 1 ? "opacity-40 pointer-events-none" : ""}">Trước</button>
      <span class="text-sm text-slate-500">Trang ${currentPage}/${totalPages}</span>
      <button data-page="next" class="page-btn rounded-lg border px-3 py-1.5 text-sm ${currentPage === totalPages ? "opacity-40 pointer-events-none" : ""}">Sau</button>`;
  }

  function renderUsers() {
    const wrap = $("#usersPanel");
    if (!wrap) return;
    wrap.innerHTML = window.ADMIN_DATA.users
      .map(
        (u) => `
      <div class="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div>
          <p class="font-semibold">${u.name}</p>
          <p class="text-sm text-slate-500">${u.email}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold">${u.orders} đơn</p>
          <p class="text-xs text-indigo-500">${u.tier}</p>
        </div>
      </div>`
      )
      .join("");
  }

  function switchSection(id) {
    activeSection = id;
    $$("[data-section]").forEach((el) => {
      el.classList.toggle("hidden", el.dataset.section !== id);
    });
    $$(".nav-item").forEach((btn) => {
      btn.classList.toggle("nav-item--active", btn.dataset.nav === id);
    });
    $("#pageTitle").textContent =
      {
        dashboard: "Dashboard",
        users: "Users",
        orders: "Orders",
        products: "Products",
        reports: "Reports",
        settings: "Settings",
      }[id] || "Dashboard";

    if (id === "products") window.AdminProducts?.refresh();
  }

  function initNav() {
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchSection(btn.dataset.nav));
    });
  }

  function initHeader() {
    const admin = window.VIXXY_ADMIN || { name: "Admin" };
    $("#adminName").textContent = admin.name || "Admin VIXXY";
    $("#adminAvatar").textContent = (admin.name || "A").charAt(0).toUpperCase();

    $("#themeToggle")?.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark");
      localStorage.setItem("vixxy_admin_theme", isDark ? "dark" : "light");
    });

    $("#logoutBtn")?.addEventListener("click", () => {
      sessionStorage.removeItem("vixxy_admin");
      window.location.href = "../login.html";
    });

    $("#searchInput")?.addEventListener("input", () => {
      currentPage = 1;
      renderOrders();
    });

    $("#pagination")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;
      const list = getFilteredOrders();
      const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
      if (btn.dataset.page === "prev" && currentPage > 1) currentPage--;
      if (btn.dataset.page === "next" && currentPage < totalPages) currentPage++;
      renderOrders();
    });

    $("#mobileMenuBtn")?.addEventListener("click", () => {
      $("#sidebar")?.classList.toggle("-translate-x-full");
    });
  }

  function boot() {
    setLoading(true);
    renderStats();
    renderChart();
    renderCategories();
    renderOrders();
    renderUsers();
    window.AdminProducts?.init();
    initNav();
    initHeader();
    switchSection("dashboard");
    setTimeout(() => setLoading(false), 450);
  }

  boot();
})();
