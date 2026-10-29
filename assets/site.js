(function(){
  "use strict";
  const money = (value, currency) => value == null ? "Add actual price" : new Intl.NumberFormat("en-CA", {style:"currency", currency:currency || "CAD"}).format(value);
  const escapeHTML = (value) => String(value || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const safeURL = (value) => { try { const u = new URL(value); return ["https:","http:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
  const grid = document.getElementById("inventory-grid");
  const items = Array.isArray(window.INVENTORY_ITEMS) ? window.INVENTORY_ITEMS : [];
  grid.innerHTML = items.map((item) => {
    const imageURL = safeURL(item.image);
    const compURL = safeURL(item.comparableSourceUrl);
    const photo = imageURL ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(item.imageAlt || item.title)}" loading="lazy" decoding="async">` : `<span class="placeholder-photo">Add actual<br>item photo</span>`;
    const comp = item.comparableSoldPrice != null && compURL ? `<a class="comp-link" href="${escapeHTML(compURL)}" target="_blank" rel="noopener noreferrer">View supporting sold comparable ↗</a>` : `<span class="inventory-note">Add a verified sold comparable + source URL</span>`;
    return `<article class="inventory-card"><div class="inventory-image">${photo}</div><span class="template-badge">Illustrative placeholder</span><div class="inventory-body"><div class="inventory-meta"><span>${escapeHTML(item.category)}</span><span>${escapeHTML(item.status)}</span></div><h3>${escapeHTML(item.title)}</h3><div class="price-block"><div><small>Your wholesale price</small><strong>${escapeHTML(money(item.wholesalePrice,item.currency))}</strong></div><div><small>Supported sold comparable</small><strong>${escapeHTML(money(item.comparableSoldPrice,item.currency))}</strong></div></div>${comp}<p class="inventory-note">${escapeHTML(item.note)}</p></div></article>`;
  }).join("");

  document.getElementById("year").textContent = new Date().getFullYear();
  const form = document.getElementById("buyer-form");
  const status = document.getElementById("form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    if (!form.checkValidity()) { form.reportValidity(); status.textContent = "Please complete the required fields."; status.classList.add("error"); return; }
    if (form.elements.company_website.value) return;
    const endpoint = window.SITE_CONFIG && safeURL(window.SITE_CONFIG.formEndpoint);
    if (!endpoint) { status.textContent = "The inquiry service is temporarily unavailable. Please try again later."; status.classList.add("error"); return; }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true; button.textContent = "Sending…";
    try {
      const response = await fetch(endpoint, {method:"POST", body:new FormData(form), headers:{Accept:"application/json"}});
      if (!response.ok) throw new Error("Submission failed");
      form.reset(); status.textContent = "Thank you—your inquiry has been sent."; status.classList.add("success");
    } catch { status.textContent = "Your inquiry could not be sent. Please try again later."; status.classList.add("error"); }
    finally { button.disabled = false; button.innerHTML = 'Send buyer inquiry <span aria-hidden="true">↗</span>'; }
  });
})();
