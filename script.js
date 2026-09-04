// ===== Product Data =====
// Product images (stock/temporary until real Kiku product photos).
const products = [
  { id: 1, name: "Mvule L-Shaped Sofa", category: "sofas", wood: "Mvule",
    img: "images/sofa-l.jpg",
    description: "Corner sofa built to order from solid Mvule. You choose the size, fabric and finish, and we build it at our Nairobi workshop.",
    features: ["Solid Mvule frame", "Fabric and finish of your choice", "Made to order", "Delivered across Kenya"] },
  { id: 2, name: "Mahogany 3-Seater Sofa Set", category: "sofas", wood: "Mahogany",
    img: "images/sofa.jpg",
    description: "A standard 3-seater sofa set in premium Mahogany, made to your size and fabric choice.",
    features: ["Solid Mahogany frame", "Fabric and finish of your choice", "Made to order", "Delivered across Kenya"] },
  { id: 3, name: "Mvule 6x6 Bed", category: "beds", wood: "Mvule",
    img: "images/bed.jpg",
    description: "Standard 6x6 bed built to order from solid Mvule. Message us your town and we'll confirm the price and delivery cost.",
    features: ["Solid Mvule construction", "Custom sizes on request", "Made to order", "Delivered across Kenya"] },
  { id: 4, name: "Mahogany 5x6 Bed", category: "beds", wood: "Mahogany",
    img: "images/bed-2.jpg",
    description: "Standard 5x6 bed in rich Mahogany, built to order with your choice of design and finish.",
    features: ["Solid Mahogany construction", "Custom sizes on request", "Made to order", "Delivered across Kenya"] },
  { id: 5, name: "Mahogany 6-Seater Dining Set", category: "dining", wood: "Mahogany",
    img: "images/dining-2.jpg",
    description: "Dining table with six seats in premium Mahogany, made to order. Ask us for the price for your town.",
    features: ["Solid Mahogany", "Table and seats built together", "Made to order", "Delivered across Kenya"] },
  { id: 6, name: "Mvule 4-Seater Dining Set", category: "dining", wood: "Mvule",
    img: "images/dining.jpg",
    description: "Compact dining set with four seats in solid Mvule, made to your size and finish.",
    features: ["Solid Mvule", "Table and seats built together", "Made to order", "Delivered across Kenya"] },
  { id: 7, name: "Mahogany TV Stand", category: "tv-coffee", wood: "Mahogany",
    img: "images/tvstand.jpg",
    description: "TV stand in premium Mahogany, built to fit your TV size and living room style.",
    features: ["Solid Mahogany", "Built to your TV size", "Made to order", "Delivered across Kenya"] },
  { id: 8, name: "Mvule Coffee Table", category: "tv-coffee", wood: "Mvule",
    img: "images/coffee.jpg",
    description: "Coffee table in solid Mvule, made to your size and finish.",
    features: ["Solid Mvule", "Built to your size", "Made to order", "Delivered across Kenya"] },
];

const CATEGORY_NAMES = {
  "sofas": "Sofa Collection",
  "beds": "Bed Collection",
  "dining": "Dining Collection",
  "tv-coffee": "Living Room Collection",
};

// ===== Render Products (Collections Page) =====
function renderProducts(filter = "all") {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <a href="product.html?id=${p.id}" class="product-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="400" />
      <div class="product-info">
        <span class="product-category">${CATEGORY_NAMES[p.category]}</span>
        <h3>${p.name}</h3>
        <p>${p.wood} hardwood, handmade at our Nairobi workshop.</p>
        <div class="product-meta">
          <span>${p.wood}</span>
          <span>Custom Sizes</span>
        </div>
        <p class="product-price">Price on WhatsApp</p>
        <span class="btn">View &amp; Enquire</span>
      </div>
    </a>
  `).join("");
}

// ===== Filter Buttons =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

// ===== Auto-filter from URL (e.g., collections.html?cat=sofas) =====
function applyURLFilter() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  if (cat) {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === cat);
    });
    renderProducts(cat);
  } else {
    renderProducts();
  }
}

// ===== Render Product Detail Page =====
function renderProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const product = products.find(p => p.id === id);

  if (!product) {
    window.location.href = "collections.html";
    return;
  }

  document.title = product.name + " — Kiku Studio";

  container.innerHTML = `
    <div class="product-detail-image">
      <img src="${product.img}" alt="${product.name}" loading="lazy" width="600" height="400" />
    </div>
    <div class="product-detail-info">
      <span class="product-category">${CATEGORY_NAMES[product.category]}</span>
      <h1>${product.name}</h1>
      <p class="price">Price on WhatsApp</p>
      <p class="description">${product.description}</p>
      <ul class="product-features">
        ${product.features.map(f => `<li>${f}</li>`).join("")}
      </ul>

      <div class="product-actions">
        <a href="https://wa.me/254741205945?text=Hello%20Kiku%20Studio,%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}.%20My%20town%20is%3A%20" target="_blank" rel="noopener" class="btn">WhatsApp About This Piece</a>
        <a href="tel:+254741205945" class="btn btn-outline-dark">Call Now</a>
      </div>

      <h3 style="margin-top:28px;">Ask for a Price or Delivery Quote</h3>
      <p style="margin-bottom:10px;">Tell us your town — we'll confirm the price and delivery cost before you order.</p>
      <form class="enquiry-form" id="product-enquiry" method="POST">
        <input type="hidden" name="product" value="${product.name}" />
        <input type="text" name="name" placeholder="Your Name *" required />
        <input type="tel" name="phone" placeholder="Phone Number *" required />
        <input type="text" name="location" placeholder="Your Town / Delivery Location *" required />
        <textarea name="message" placeholder="Any questions? Sizes, fabric, colour..." rows="3"></textarea>
        <button type="submit" class="btn">Send Enquiry</button>
      </form>
    </div>
  `;
}

// ===== Mobile Menu Toggle =====
const menuToggle = document.querySelector(".menu-toggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const header = menuToggle.closest("header");
    const open = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll("header nav a, #site-nav a").forEach(link => {
    link.addEventListener("click", () => {
      const header = menuToggle.closest("header");
      header.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== Send Enquiries via WhatsApp (no backend required) =====
// All enquiry forms (custom orders, contact, product pages) build a
// pre-filled WhatsApp message from the entered fields and open WhatsApp.
// No data is stored or sent anywhere else.
const WHATSAPP_NUMBER = "254741205945";

function submitToWhatsApp(e) {
  const form = e.target;
  const data = new FormData(form);
  const lines = [];

  if (data.get("product")) lines.push("Product: " + data.get("product"));

  ["name", "phone", "location", "furniture_type", "finish", "interest", "wood", "dimensions", "budget", "subject", "details", "message", "email"]
    .forEach(key => {
      const val = data.get(key);
      if (val) lines.push(key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ") + ": " + val);
    });

  const text = encodeURIComponent("Hello Kiku Studio,\n\n" + lines.join("\n"));
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

document.addEventListener("submit", e => {
  if (e.target.classList.contains("enquiry-form")) {
    e.preventDefault();
    submitToWhatsApp(e);
  }
});

// ===== Initialize =====
applyURLFilter();
renderProductDetail();
