export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Console {
  id: number;
  name: string;
  company: string;
  year: number;
  icon: string;
}

export interface Game {
  id: number;
  title: string;
  console_id: number;
  console_name: string;
  cover_url: string;
  rom_url: string;
  description: string;
  popularity: number;
  category: string;
}

export interface SaveState {
  id: number;
  user_id: number;
  game_id: number;
  save_data: string;
  updated_at: string;
}
