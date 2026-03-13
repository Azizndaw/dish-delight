import { Product } from "@/components/ProductCard";

export const categories = [
  { id: "assiettes", name: "Assiettes & Plats" },
  { id: "bols", name: "Bols & Saladiers" },
  { id: "verres", name: "Verres & Tasses" },
  { id: "couverts", name: "Couverts" },
  { id: "services", name: "Services complets" },
  { id: "vaisselle-divers", name: "Vaisselle divers" },
];

export const senegalRegions = [
  "Dakar",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Thiès",
  "Ziguinchor",
];

export const deliveryZones = [
  { id: "dakar_centre", name: "Dakar Centre (Plateau, Medina, etc.)", price: 1500 },
  { id: "almadies", name: "Almadies / Ngor / Ouakam", price: 2000 },
  { id: "banlieue_proche", name: "Pikine / Guédiawaye / Parcelles", price: 2500 },
  { id: "banlieue_lointaine", name: "Rufisque / Keur Massar / Diamniadio", price: 3500 },
  { id: "autre_region", name: "Autres régions (Expédition)", price: 5000 },
];

// Format price in FCFA
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
};
