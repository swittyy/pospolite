import catalog from "../../data/catalog.json";

export type Availability = "unknown" | "in_stock" | "out_of_stock";

export interface Product {
  code: string;
  name: string;
  details: string;
  price: string;
  note: string;
  symbol: string;
  availability: Availability;
}

export interface Category {
  slug: string;
  title: string;
  index: string;
  description: string;
  products: Product[];
}

// data/catalog.json is the single source of truth: the Rust API starts from it and the static build reads it.
export const categories = catalog.categories as Category[];

export const getCategory = (slug: string): Category | undefined =>
  categories.find((category) => category.slug === slug);
