// ===== Product Data =====
const products = [
  { id: 1, name: "L-Shaped Sofa", category: "sofas",
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600",
    description: "Corner sofa built to order. You choose the size, fabric and finish, and we build it at our Nairobi workshop.",
    features: ["Made to order", "Fabric and finish of your choice", "Delivered across Kenya"] },
  { id: 2, name: "3-Seater Sofa Set", category: "sofas",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    description: "A standard 3-seater sofa set made to your size and fabric choice.",
    features: ["Made to order", "Fabric and finish of your choice", "Delivered across Kenya"] },
  { id: 3, name: "6x6 Bed", category: "beds",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    description: "Standard 6x6 bed built to order. Message us your town and we'll confirm the price and delivery cost.",
    features: ["Made to order", "Custom sizes on request", "Delivered across Kenya"] },
  { id: 4, name: "5x6 Bed", category: "beds",
    img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
    description: "Standard 5x6 bed built to order with your choice of design and finish.",
    features: ["Made to order", "Custom sizes on request", "Delivered across Kenya"] },
  { id: 5, name: "6-Seater Dining Set", category: "dining",
    img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600",
    description: "Dining table with six seats, made to order. Ask us for the price for your town.",
    features: ["Made to order", "Table and seats built together", "Delivered across Kenya"] },
  { id: 6, name: "4-Seater Dining Set", category: "dining",
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600",
    description: "Compact dining set with four seats, made to your size and finish.",
    features: ["Made to order", "Table and seats built together", "Delivered across Kenya"] },
  { id: 7, name: "TV Stand", category: "tv-coffee",
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600",
    description: "TV stand built to fit your TV size and living room style.",
    features: ["Made to order", "Built to your TV size", "Delivered across Kenya"] },
  { id: 8, name: "Coffee Table", category: "tv-coffee",
    img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600",
    description: "Coffee table made to your size and finish.",
    features: ["Made to order", "Built to your size", "Delivered across Kenya"] },
];

// ===== Render Products (Collections Page) =====
function renderProducts(filter = "all") {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <a href="product.html?id=${p.id}" class="product-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="400" />
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-wood">🪵 Made to order</p>
        <p class="product-price">Price on WhatsApp</p>
        <span class="btn">View Details</span>
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
      <h1>${product.name}</h1>
      <p class="price">Price on WhatsApp</p>
      <p class="description">${product.description}</p>
      <ul class="product-features">
        ${product.features.map(f => `<li>✓ ${f}</li>`).join("")}
      </ul>

      <h3>Ask for a Price or Delivery Quote</h3>
      <p style="margin-bottom:10px;">Tell us your town — we'll confirm the price and delivery cost before you order.</p>
      <form class="enquiry-form" id="product-enquiry" method="POST" style="padding:20px; margin-top:15px;">
        <input type="hidden" name="product" value="${product.name}" />
        <input type="text" name="name" placeholder="Your Name *" required />
        <input type="tel" name="phone" placeholder="Phone Number *" required />
        <input type="text" name="location" placeholder="Your Town / Delivery Location *" required />
        <textarea name="message" placeholder="Any questions? Sizes, fabric, colour..." rows="3"></textarea>
        <button type="submit" class="btn">Send Enquiry</button>
      </form>

      <p style="margin-top:20px; text-align:center;">
        Or chat with us directly:
        <a href="https://wa.me/254741205945?text=Hi,%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}" target="_blank" rel="noopener" style="color:#25D366; font-weight:bold;">WhatsApp Now</a>
      </p>
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

  document.querySelectorAll("header nav a").forEach(link => {
    link.addEventListener("click", () => {
      const header = menuToggle.closest("header");
      header.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== Send Enquiries via WhatsApp (no backend required) =====
const WHATSAPP_NUMBER = "254741205945";

function submitToWhatsApp(e) {
  const form = e.target;
  const data = new FormData(form);
  const lines = [];

  if (data.get("product")) lines.push("Product: " + data.get("product"));

  ["name", "phone", "location", "furniture_type", "finish", "dimensions", "budget", "subject", "details", "message", "email"]
    .forEach(key => {
      const val = data.get(key);
      if (val) lines.push(key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ") + ": " + val);
    });

  const contactMethod = data.get("contact_method");
  if (contactMethod) lines.push("Preferred Contact: " + contactMethod);

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
