export type Difficulty = 'Facile' | 'Modérée' | 'Difficile' | 'Très difficile';

export type ProductCategory = 'pieces' | 'outils' | 'kits';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
}

export interface Device {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  manufacturer: string | null;
  image_url: string | null;
  description: string | null;
  category?: Category | null;
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  device_id: string | null;
  category_id: string | null;
  author_id: string | null;
  summary: string | null;
  introduction: string | null;
  tools_required: string[] | null;
  difficulty: Difficulty;
  time_minutes: number;
  published: boolean;
  featured: boolean;
  views: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  device?: Device | null;
}

export interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string | null;
  description: string;
  image_url: string | null;
}

export interface CommunitySolution {
  id: string;
  title: string;
  device_id: string | null;
  author_id: string | null;
  content: string;
  upvotes: number;
  created_at: string;
  device?: Device | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  description: string | null;
  image_url: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  compatibility: string | null;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  image_url: string | null;
  category: string;
  published_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FixbotMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}
