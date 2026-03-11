import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database
  const db = new Database("retroplay.db");
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      photo TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      year INTEGER,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      console_id INTEGER,
      cover_url TEXT,
      rom_url TEXT,
      description TEXT,
      popularity INTEGER DEFAULT 0,
      category TEXT,
      FOREIGN KEY(console_id) REFERENCES consoles(id)
    );

    CREATE TABLE IF NOT EXISTS saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      game_id INTEGER,
      save_data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(game_id) REFERENCES games(id)
    );
  `);

  // Seed initial data if empty
  const consoleCount = db.prepare("SELECT COUNT(*) as count FROM consoles").get() as { count: number };
  if (consoleCount.count === 0) {
    const insertConsole = db.prepare("INSERT INTO consoles (name, company, year, icon) VALUES (?, ?, ?, ?)");
    insertConsole.run("Nintendo 64", "Nintendo", 1996, "videogame_asset");
    insertConsole.run("Super Nintendo", "Nintendo", 1990, "videogame_asset");
    insertConsole.run("Playstation", "Sony", 1994, "videogame_asset");
    insertConsole.run("GameBoy Advance", "Nintendo", 2001, "videogame_asset");
    insertConsole.run("Sega Genesis", "Sega", 1988, "videogame_asset");

    // Seed default user
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      "Admin User", 
      "torrestecnologiaia@gmail.com", 
      "admin123", 
      "admin"
    );

    const insertGame = db.prepare("INSERT INTO games (title, console_id, cover_url, rom_url, description, popularity, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    // Nintendo 64
    insertGame.run(
      "The Legend of Zelda: Ocarina of Time", 
      1, 
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Embark on an epic quest through time to save the land of Hyrule.", 
      100, 
      "Featured"
    );
    insertGame.run(
      "Super Mario 64", 
      1, 
      "https://images.unsplash.com/photo-1612684505740-029474e7d58e?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Mario's first 3D adventure in the Mushroom Kingdom.", 
      95, 
      "Popular"
    );

    // SNES
    insertGame.run(
      "Super Metroid", 
      2, 
      "https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "The ultimate hunt begins on planet Zebes.", 
      90, 
      "Classic"
    );
    insertGame.run(
      "Donkey Kong Country", 
      2, 
      "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Join Donkey and Diddy on a jungle adventure.", 
      85, 
      "Classic"
    );

    // Playstation
    insertGame.run(
      "Castlevania: Symphony of the Night", 
      3, 
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Explore Dracula's castle as Alucard.", 
      88, 
      "Popular"
    );
    insertGame.run(
      "Final Fantasy VII", 
      3, 
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Cloud Strife joins a rebel group to save the world.", 
      98, 
      "Popular"
    );

    // GBA
    insertGame.run(
      "Pokémon Emerald", 
      4, 
      "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "The definitive Pokémon experience on GBA.", 
      92, 
      "Handheld"
    );
    insertGame.run(
      "Metroid Fusion", 
      4, 
      "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Samus faces a deadly parasite in deep space.", 
      87, 
      "Handheld"
    );

    // Sega
    insertGame.run(
      "Sonic the Hedgehog", 
      5, 
      "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "Speed through Green Hill Zone with Sonic.", 
      85, 
      "Sega"
    );
    insertGame.run(
      "Streets of Rage 2", 
      5, 
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", 
      "#", 
      "The ultimate beat 'em up experience.", 
      82, 
      "Sega"
    );
  }

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.get("/api/games", (req, res) => {
    const games = db.prepare(`
      SELECT g.*, c.name as console_name 
      FROM games g 
      JOIN consoles c ON g.console_id = c.id
    `).all();
    res.json(games);
  });

  app.get("/api/consoles", (req, res) => {
    const consoles = db.prepare("SELECT * FROM consoles").all();
    res.json(consoles);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
