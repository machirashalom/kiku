export type CategorySlug = "sofas" | "beds" | "dining" | "tv-coffee";

export type Category = {
  slug: CategorySlug;
  name: string;
  blurb: string;
  image: string;
};

export type Wood = "Mvule" | "Mahogany" | "Mvule & Mahogany";

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  wood: Wood;
  sizes: string;
  leadTime: string;
  image: string;
  description: string;
};

export const SITE = {
  phone: "+254741205945",
  whatsapp: "https://wa.me/254741205945",
  email: "machirashalom@gmail.com",
  address: "Getathuru Road, Nairobi, Kenya",
};

export const categories: Category[] = [
  {
    slug: "sofas",
    name: "Sofa Sets & L-Seats",
    blurb: "Handmade Mvule and Mahogany sofa sets and L-seats",
    image: "/images/sofa.jpg",
  },
  {
    slug: "beds",
    name: "Beds",
    blurb: "Handmade hardwood beds from Mvule and Mahogany",
    image: "/images/bed.jpg",
  },
  {
    slug: "dining",
    name: "Dining Sets",
    blurb: "Handmade Mvule and Mahogany dining sets",
    image: "/images/dining.jpg",
  },
  {
    slug: "tv-coffee",
    name: "TV Stands & Coffee Tables",
    blurb: "Handmade TV stands and coffee tables",
    image: "/images/tvstand.jpg",
  },
];

export const products: Product[] = [
  {
    slug: "mvule-l-shaped-sofa",
    name: "Mvule L-Shaped Sofa",
    category: "sofas",
    wood: "Mvule",
    sizes: "Made to your measurements",
    leadTime: "We confirm the build time when you order",
    image: "/images/sofa-l.jpg",
    description:
      "Corner sofa built to order from solid Mvule. You choose the size, fabric and finish, and we build it at our Nairobi workshop.",
  },
  {
    slug: "mahogany-3-seater-sofa-set",
    name: "Mahogany 3-Seater Sofa Set",
    category: "sofas",
    wood: "Mahogany",
    sizes: "Standard 3-seater",
    leadTime: "We confirm the build time when you order",
    image: "/images/sofa.jpg",
    description:
      "A standard 3-seater sofa set in premium Mahogany, made to your size and fabric choice.",
  },
  {
    slug: "mvule-6x6-bed",
    name: "Mvule 6x6 Bed",
    category: "beds",
    wood: "Mvule",
    sizes: "Standard 6x6",
    leadTime: "We confirm the build time when you order",
    image: "/images/bed.jpg",
    description:
      "Standard 6x6 bed built to order from solid Mvule. Message us your town and we'll confirm the price and delivery cost.",
  },
  {
    slug: "mahogany-5x6-bed",
    name: "Mahogany 5x6 Bed",
    category: "beds",
    wood: "Mahogany",
    sizes: "Standard 5x6",
    leadTime: "We confirm the build time when you order",
    image: "/images/bed-2.jpg",
    description:
      "Standard 5x6 bed in rich Mahogany, built to order with your choice of design and finish.",
  },
  {
    slug: "mahogany-6-seater-dining-set",
    name: "Mahogany 6-Seater Dining Set",
    category: "dining",
    wood: "Mahogany",
    sizes: "Table with six seats",
    leadTime: "We confirm the build time when you order",
    image: "/images/dining-2.jpg",
    description:
      "Dining table with six seats in premium Mahogany, made to order. Ask us for the price for your town.",
  },
  {
    slug: "mvule-4-seater-dining-set",
    name: "Mvule 4-Seater Dining Set",
    category: "dining",
    wood: "Mvule",
    sizes: "Table with four seats",
    leadTime: "We confirm the build time when you order",
    image: "/images/dining.jpg",
    description:
      "Compact dining set with four seats in solid Mvule, made to your size and finish.",
  },
  {
    slug: "mahogany-tv-stand",
    name: "Mahogany TV Stand",
    category: "tv-coffee",
    wood: "Mahogany",
    sizes: "Built to your TV size",
    leadTime: "We confirm the build time when you order",
    image: "/images/tvstand.jpg",
    description:
      "TV stand in premium Mahogany, built to fit your TV size and living room style.",
  },
  {
    slug: "mvule-coffee-table",
    name: "Mvule Coffee Table",
    category: "tv-coffee",
    wood: "Mvule",
    sizes: "Built to your size",
    leadTime: "We confirm the build time when you order",
    image: "/images/coffee.jpg",
    description: "Coffee table in solid Mvule, made to your size and finish.",
  },
];

export const testimonials = [
  {
    quote:
      "Our L-sofa was built to the exact size of our lounge. Solid wood, beautiful finish — and delivered to Mombasa without fuss.",
    name: "Amina",
    town: "Nairobi",
  },
  {
    quote:
      "We ordered a Mvule dining set for our new home. Clear pricing on WhatsApp and the quality is exactly what we hoped for.",
    name: "James",
    town: "Kisumu",
  },
  {
    quote:
      "Visited the showroom on Getathuru Road, then ordered a custom bed. Straightforward process from start to finish.",
    name: "Faith",
    town: "Nakuru",
  },
];

export const faqs = [
  {
    q: "Do you deliver nationwide?",
    a: "Yes, we deliver across Kenya. Delivery cost depends on the destination and furniture size — we confirm it on WhatsApp before you order.",
  },
  {
    q: "Can I request custom dimensions?",
    a: "Yes. Most of our furniture can be made to your room size, preferred wood and finish.",
  },
  {
    q: "What wood do you use?",
    a: "We build with premium Mvule and Mahogany hardwood.",
  },
  {
    q: "How long does a custom order take?",
    a: "It depends on the piece and its complexity. We confirm the build time when you place the order.",
  },
];
