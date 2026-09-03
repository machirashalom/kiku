// ===== Product Data =====
const products = [
  { id: 1, name: "Classic Mahogany Sofa", category: "sofas", wood: "Mahogany", price: "From KSh 85,000",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    description: "A timeless three-seater sofa handcrafted from solid mahogany with premium upholstery. Perfect centerpiece for any living room.",
    features: ["Solid Mahogany frame", "Handwoven cushions", "Custom upholstery available", "5-year warranty"] },
  { id: 2, name: "Mvule King Bed", category: "beds", wood: "Mvule", price: "From KSh 120,000",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    description: "Luxurious king-size bed frame crafted from durable Mvule hardwood. Built to last a lifetime.",
    features: ["Solid Mvule construction", "King size (6x6)", "Custom sizes available", "Natural finish"] },
  { id: 3, name: "Mahogany Dining Table", category: "tables", wood: "Mahogany", price: "From KSh 95,000",
    img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600",
    description: "8-seater dining table with beautiful mahogany grain. Seats the whole family in style.",
    features: ["Seats 8 people", "Solid Mahogany top", "Matching chairs available", "Custom sizes"] },
  { id: 4, name: "Handcrafted Mvule Stool", category: "stools", wood: "Mvule", price: "From KSh 8,500",
    img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600",
    description: "Rustic handcrafted stool from a single piece of Mvule hardwood. Perfect for kitchens and bars.",
    features: ["Single-piece Mvule", "Handcrafted finish", "Multiple heights available", "Weather-resistant"] },
  { id: 5, name: "Two-Seater Mvule Sofa", category: "sofas", wood: "Mvule", price: "From KSh 65,000",
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600",
    description: "Compact two-seater with the rugged beauty of Mvule hardwood and modern comfort.",
    features: ["Solid Mvule frame", "Removable cushions", "Fabric choices available", "5-year warranty"] },
  { id: 6, name: "Mahogany Queen Bed", category: "beds", wood: "Mahogany", price: "From KSh 95,000",
    img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
    description: "Elegant queen-size bed frame in rich mahogany. A statement piece for any bedroom.",
    features: ["Solid Mahogany", "Queen size", "Custom headboards", "Natural oil finish"] },
  { id: 7, name: "Coffee Table – Mvule", category: "tables", wood: "Mvule", price: "From KSh 35,000",
    img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600",
    description: "Modern coffee table with a live-edge Mvule top. Each piece is unique.",
    features: ["Live-edge design", "Solid Mvule", "Unique grain patterns", "Natural finish"] },
  { id: 8, name: "Bar Stool Set", category: "stools", wood: "Mahogany", price: "From KSh 12,000",
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600",
    description: "Set of two mahogany bar stools with padded seats. Elegant and comfortable.",
    features: ["Set of 2", "Solid Mahogany", "Padded seats", "Bar height (75cm)"] },
];

// ===== Render Products (Collections Page) =====
function renderProducts(filter = "all") {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <a href="product.html?id=${p.id}" class="product-card">
      <img src="${p.img}" alt="${p.name}" />
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-wood">🌳 ${p.wood} Hardwood</p>
        <p class="product-price">${p.price}</p>
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
  const product = products.find(p => p.id === id) || products[0];

  container.innerHTML = `
    <div class="product-detail-image">
      <img src="${product.img}" alt="${product.name}" />
    </div>
    <div class="product-detail-info">
      <h1>${product.name}</h1>
      <p class="price">${product.price}</p>
      <p class="description">${product.description}</p>
      <ul class="product-features">
        ${product.features.map(f => `<li>✓ ${f}</li>`).join("")}
      </ul>

      <h3>Interested? Send an Enquiry</h3>
      <form class="enquiry-form" id="product-enquiry" method="POST" style="padding:20px; margin-top:15px;">
        <input type="hidden" name="product" value="${product.name}" />
        <input type="text" name="name" placeholder="Your Name *" required />
        <input type="email" name="email" placeholder="Email *" required />
        <input type="tel" name="phone" placeholder="Phone *" required />
        <input type="text" name="location" placeholder="Delivery Location *" required />
        <textarea name="message" placeholder="Any questions or customizations?" rows="4"></textarea>
        <select name="contact_method">
          <option value="">Preferred Contact Method</option>
          <option>WhatsApp</option>
          <option>Phone Call</option>
        </select>
        <button type="submit" class="btn">Send Enquiry</button>
      </form>

      <p style="margin-top:20px; text-align:center;">
        Or chat with us directly:
        <a href="https://wa.me/254741205945?text=Hi,%20I'm%20interested%20in%20the%20${encodeURIComponent(product.name)}" target="_blank" style="color:#25D366; font-weight:bold;">💬 WhatsApp Now</a>
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
}

// ===== Send Enquiries via WhatsApp (no backend required) =====
const WHATSAPP_NUMBER = "254741205945";

function submitToWhatsApp(e) {
  const form = e.target;
  const data = new FormData(form);
  const lines = [];

  if (data.get("product")) lines.push("Product: " + data.get("product"));

  ["name", "email", "phone", "location", "wood_type", "furniture_type", "dimensions", "budget", "subject", "details", "message"]
    .forEach(key => {
      const val = data.get(key);
      if (val) lines.push(key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ") + ": " + val);
    });

  const contactMethod = data.get("contact_method");
  if (contactMethod) lines.push("Preferred Contact: " + contactMethod);

  const text = encodeURIComponent("Hello Kiku Studio,\n\n" + lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
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