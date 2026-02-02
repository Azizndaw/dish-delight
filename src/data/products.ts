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
    title: "Grand bol à thiéboudienne en inox 40cm",
    price: 5000,
    location: "Dakar - Médina",
    image: productImages[0],
    condition: "Très bon état",
    category: "Bols",
  },
  {
    id: "2",
    title: "Lot de 6 verres à thé marocains décorés",
    price: 3500,
    location: "Thiès",
    image: productImages[1],
    condition: "Bon état",
    isLot: true,
    category: "Verres",
  },
  {
    id: "3",
    title: "Service de 12 assiettes plates en mélamine",
    price: 8000,
    location: "Saint-Louis",
    image: productImages[2],
    condition: "Très bon état",
    isLot: true,
    category: "Assiettes",
  },
  {
    id: "4",
    title: "Grande marmite en aluminium 20 litres",
    price: 15000,
    location: "Dakar - Pikine",
    image: productImages[3],
    condition: "Neuf",
    category: "Marmites",
  },
  {
    id: "5",
    title: "Lot de 24 cuillères et fourchettes inox",
    price: 6000,
    location: "Kaolack",
    image: productImages[4],
    condition: "Bon état",
    isLot: true,
    category: "Couverts",
  },
  {
    id: "6",
    title: "Théière traditionnelle avec plateau doré",
    price: 7500,
    location: "Ziguinchor",
    image: productImages[5],
    condition: "Très bon état",
    isLot: true,
    category: "Théières",
  },
  {
    id: "7",
    title: "Bassine en plastique grande taille",
    price: 2500,
    location: "Dakar - Parcelles",
    image: productImages[6],
    condition: "État correct",
    category: "Bassines",
  },
  {
    id: "8",
    title: "Set de 6 tasses à café avec soucoupes",
    price: 4500,
    location: "Mbour",
    image: productImages[7],
    condition: "Très bon état",
    category: "Tasses",
  },
];

export const categories = [
  { id: "bols", name: "Bols & Saladiers", count: 312 },
  { id: "assiettes", name: "Assiettes", count: 245 },
  { id: "marmites", name: "Marmites", count: 156 },
  { id: "theieres", name: "Théières", count: 128 },
  { id: "verres", name: "Verres", count: 203 },
  { id: "couverts", name: "Couverts", count: 97 },
  { id: "lots", name: "Lots complets", count: 89 },
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
