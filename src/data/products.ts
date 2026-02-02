import { Product } from "@/components/ProductCard";

// Images de vaisselle sénégalaise typique
const productImages = [
  "https://images.unsplash.com/photo-1603199506016-b9c31a9c79a7?w=400&h=400&fit=crop", // Bol traditionnel
  "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1525974160448-038dacadcc71?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1604066807851-f60b3fe1bbf7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?w=400&h=400&fit=crop",
];

export const sampleProducts: Product[] = [
  {
    id: "1",
    title: "Service de 12 assiettes plates en porcelaine",
    price: 15000,
    location: "Dakar - Plateau",
    image: "https://images.unsplash.com/photo-1591192453812-7162a3465dd8?q=80&w=800",
    condition: "Neuf",
    category: "assiettes",
  },
  {
    id: "2",
    title: "Lot de 6 verres à thé décorés",
    price: 3500,
    location: "Thiès - Escale",
    image: "https://images.unsplash.com/photo-1544787210-2211d247156e?q=80&w=800",
    condition: "Très bon état",
    isLot: true,
    category: "verres",
  },
  {
    id: "3",
    title: "Grand bol à Thiéboudienne en inox (50cm)",
    price: 7500,
    location: "Saint-Louis - Sor",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800",
    condition: "Bon état",
    category: "bols",
  },
  {
    id: "4",
    title: "Lot de 12 assiettes en mélamine colorées",
    price: 6000,
    location: "Dakar - Parcelles Assainies",
    image: "https://images.unsplash.com/photo-1621327017866-6fb07e6c96ca?q=80&w=800",
    condition: "Très bon état",
    isLot: true,
    category: "assiettes",
  },
  {
    id: "5",
    title: "Salière et poivrière en céramique",
    price: 2500,
    location: "Mbour - Saly",
    image: "https://images.unsplash.com/photo-1444124818704-4539a48d5043?q=80&w=800",
    condition: "Très bon état",
    category: "vaisselle-divers",
  },
  {
    id: "6",
    title: "Service de 6 tasses à café avec soucoupes",
    price: 8000,
    location: "Dakar - Ouakam",
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?q=80&w=800",
    condition: "Neuf",
    isLot: true,
    category: "verres",
  },
  {
    id: "7",
    title: "Set de 24 couverts en inox",
    price: 8500,
    location: "Kaolack",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800",
    condition: "Très bon état",
    isLot: true,
    category: "couverts",
  },
  {
    id: "8",
    title: "Plat de service ovale en inox",
    price: 4500,
    location: "Ziguinchor",
    image: "https://images.unsplash.com/photo-1594913785162-e6785b49dea7?q=80&w=800",
    condition: "Bon état",
    category: "assiettes",
  },
];

export const categories = [
  { id: "assiettes", name: "Assiettes & Plats", count: 245 },
  { id: "bols", name: "Bols & Saladiers", count: 312 },
  { id: "verres", name: "Verres & Tasses", count: 203 },
  { id: "couverts", name: "Couverts", count: 97 },
  { id: "services", name: "Services complets", count: 128 },
  { id: "vaisselle-divers", name: "Vaisselle divers", count: 45 },
];

export const senegalRegions = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Kaolack",
  "Ziguinchor",
  "Mbour",
  "Rufisque",
  "Pikine",
  "Guédiawaye",
  "Touba",
  "Diourbel",
  "Louga",
  "Tambacounda",
  "Fatick",
  "Kolda",
  "Matam",
  "Sédhiou",
  "Kédougou",
];

// Format price in FCFA
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
};
