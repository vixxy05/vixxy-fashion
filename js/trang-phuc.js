(function () {
  const grid = document.getElementById("clothing-grid");
  const items = window.CLOTHING_CATALOG;
  if (!grid || !items) return;

  grid.innerHTML = items
    .map(
      (p) => `
    <article class="clothing-card">
      <div class="clothing-card__frame">
        <img src="images/clothing/${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <h3 class="clothing-card__name">${p.name}</h3>
      <p class="clothing-card__price">${p.price}</p>
    </article>`
    )
    .join("");
})();
