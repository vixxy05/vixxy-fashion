(function () {
  const STORAGE_KEY = "vixxy_admin_products";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const fmtMoney = (v) =>
    new Intl.NumberFormat("vi-VN").format(Number(v) || 0) + " ₫";

  let products = [];
  let filterCategory = "Tất cả";
  let editingId = null;

  function loadProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        products = JSON.parse(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    products = JSON.parse(JSON.stringify(window.ADMIN_DATA.products || []));
    saveProducts();
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.ADMIN_DATA.products = products;
  }

  function getFiltered() {
    if (filterCategory === "Tất cả") return products;
    return products.filter((p) => p.category === filterCategory);
  }

  function renderSalesSummary() {
    const wrap = $("#productSalesSummary");
    if (!wrap) return;

    const groups = ["Trang phục", "Trang sức", "Phụ kiện"];
    wrap.innerHTML = groups
      .map((cat) => {
        const items = products.filter((p) => p.category === cat);
        const totalSold = items.reduce((s, p) => s + (p.sold || 0), 0);
        const revenue = items.reduce((s, p) => s + (p.sold || 0) * (p.price || 0), 0);
        return `
        <div class="sales-card">
          <p class="sales-card__label">${cat}</p>
          <p class="sales-card__value">${totalSold} đã bán</p>
          <p class="sales-card__sub">${fmtMoney(revenue)} doanh thu</p>
        </div>`;
      })
      .join("");
  }

  function renderTable() {
    const tbody = $("#productsTableBody");
    const empty = $("#productsEmpty");
    if (!tbody) return;

    const list = getFiltered();
    if (list.length === 0) {
      tbody.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }
    empty?.classList.add("hidden");

    tbody.innerHTML = list
      .map(
        (p) => `
      <tr>
        <td><img src="${p.image}" alt="${p.name}" class="product-thumb" onerror="this.src='../images/nentrangchu.png'"></td>
        <td>
          <p class="font-semibold">${p.name}</p>
          <p class="text-xs text-slate-500">${p.description || ""}</p>
        </td>
        <td><span class="cat-badge">${p.category}</span></td>
        <td class="font-semibold">${fmtMoney(p.price)}</td>
        <td><strong class="text-emerald-500">${p.sold || 0}</strong></td>
        <td>${p.stock || 0}</td>
        <td class="font-semibold">${fmtMoney((p.sold || 0) * (p.price || 0))}</td>
        <td class="text-right">
          <button type="button" class="btn-sm btn-edit" data-edit="${p.id}">Sửa</button>
          <button type="button" class="btn-sm btn-del" data-del="${p.id}">Xóa</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function openModal(product) {
    editingId = product?.id || null;
    $("#productModalTitle").textContent = product ? "Sửa sản phẩm" : "Thêm sản phẩm";
    $("#pfName").value = product?.name || "";
    $("#pfCategory").value = product?.category || "Trang phục";
    $("#pfPrice").value = product?.price || "";
    $("#pfStock").value = product?.stock ?? "";
    $("#pfSold").value = product?.sold ?? 0;
    $("#pfImage").value = product?.image || "";
    $("#pfDesc").value = product?.description || "";
    $("#productPreview").src = product?.image || "../images/nentrangchu.png";
    $("#productModal").classList.remove("hidden");
  }

  function closeModal() {
    editingId = null;
    $("#productModal").classList.add("hidden");
  }

  function bindEvents() {
    $("#addProductBtn")?.addEventListener("click", () => openModal(null));

    $("#productModalClose")?.addEventListener("click", closeModal);
    $("#productModalCancel")?.addEventListener("click", closeModal);

    $("#pfImage")?.addEventListener("input", (e) => {
      $("#productPreview").src = e.target.value || "../images/nentrangchu.png";
    });

    $("#productForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        id: editingId || "p-" + Date.now(),
        name: $("#pfName").value.trim(),
        category: $("#pfCategory").value,
        price: Number($("#pfPrice").value) || 0,
        stock: Number($("#pfStock").value) || 0,
        sold: Number($("#pfSold").value) || 0,
        image: $("#pfImage").value.trim(),
        description: $("#pfDesc").value.trim(),
      };
      if (!payload.name) return;

      if (editingId) {
        products = products.map((p) => (p.id === editingId ? { ...p, ...payload } : p));
      } else {
        products.unshift(payload);
      }
      saveProducts();
      closeModal();
      renderSalesSummary();
      renderTable();
    });

    $("#productsTableBody")?.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit]");
      const delBtn = e.target.closest("[data-del]");
      if (editBtn) {
        const p = products.find((x) => x.id === editBtn.dataset.edit);
        if (p) openModal(p);
      }
      if (delBtn) {
        const id = delBtn.dataset.del;
        if (confirm("Xóa sản phẩm này?")) {
          products = products.filter((p) => p.id !== id);
          saveProducts();
          renderSalesSummary();
          renderTable();
        }
      }
    });

    $$(".product-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        filterCategory = btn.dataset.filter;
        $$(".product-filter").forEach((b) =>
          b.classList.toggle("product-filter--active", b === btn)
        );
        renderTable();
      });
    });
  }

  window.AdminProducts = {
    init() {
      loadProducts();
      renderSalesSummary();
      renderTable();
      bindEvents();
    },
    refresh() {
      renderSalesSummary();
      renderTable();
    },
  };
})();
