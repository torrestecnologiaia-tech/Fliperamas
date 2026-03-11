import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Info, 
  Search, 
  User, 
  Gamepad2, 
  Library, 
  ChevronRight, 
  Star, 
  History,
  ArrowLeft,
  Settings,
  LogOut,
  Download
} from 'lucide-react';
import { User as UserType, Game, Console } from './types';

// Mock Auth Hook (Simplified for this demo)
const useAuth = () => {
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('retroplay_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      localStorage.setItem('retroplay_user', JSON.stringify(data));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('retroplay_user');
  };

  return { user, login, logout };
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, consolesRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/consoles')
        ]);
        setGames(await gamesRes.json());
        setConsoles(await consolesRes.json());
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <GameDetailView 
              game={selectedGame} 
              onBack={() => setSelectedGame(null)} 
            />
          ) : (
            <HomeView 
              games={games} 
              consoles={consoles} 
              onSelectGame={setSelectedGame} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-dark/95 backdrop-blur-xl border-t border-white/5 py-3 px-6 flex justify-between items-center z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Library size={24} />} label="Home" />
        <NavButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon={<Search size={24} />} label="Search" />
        <NavButton active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Gamepad2 size={24} />} label="Library" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-white/40'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function LoginView({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email, setEmail] = useState('torrestecnologiaia@gmail.com');
  const [password, setPassword] = useState('admin123');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-bg-dark">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-primary tracking-tighter italic">RETROPLAY</h1>
          <p className="mt-2 text-white/60">Fliperama</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-surface border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary transition-colors"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-surface border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary transition-colors"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            onClick={() => onLogin(email, password)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            SIGN IN
          </button>
        </div>
        
        <div className="text-center">
          <button className="text-white/40 text-sm hover:text-white transition-colors">Forgot Password?</button>
        </div>
      </div>
    </div>
  );
}

function HomeView({ games, consoles, onSelectGame }: { games: Game[], consoles: Console[], onSelectGame: (g: Game) => void }) {
  const featured = games.find(g => g.category === 'Featured') || games[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-10"
    >
      {/* Hero Section */}
      {featured && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <img 
            src={featured.cover_url} 
            className="absolute inset-0 w-full h-full object-cover scale-110 animate-pulse-slow" 
            alt={featured.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-[12px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/40">Featured Game</span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-black">4.9</span>
              </div>
            </div>
            <h2 className="text-6xl font-black leading-none tracking-tighter uppercase italic drop-shadow-2xl">{featured.title}</h2>
            <p className="text-white/80 text-lg max-w-md line-clamp-3 font-medium">{featured.description}</p>
            
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => onSelectGame(featured)}
                className="flex-1 max-w-[200px] bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl hover:bg-primary hover:text-white"
              >
                <Play size={24} fill="currentColor" /> PLAY NOW
              </button>
              <button 
                onClick={() => onSelectGame(featured)}
                className="bg-white/10 backdrop-blur-xl text-white font-bold px-6 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-white/20 hover:bg-white/20"
              >
                <Info size={24} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="px-6 space-y-12 pb-10">
        {/* Console Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
              <Gamepad2 className="text-primary" /> Select Console
            </h3>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
            {consoles.map(c => (
              <motion.div 
                key={c.id} 
                whileHover={{ y: -10, scale: 1.05 }}
                className="flex-shrink-0 w-32 group cursor-pointer"
              >
                <div className="aspect-square bg-surface rounded-3xl flex flex-col items-center justify-center gap-3 border border-white/5 group-hover:border-primary/50 transition-all shadow-xl group-hover:shadow-primary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Gamepad2 size={32} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tighter text-center px-2 z-10">{c.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Game Rows by Console */}
        {consoles.map(console => (
          <GameRow 
            key={console.id}
            title={console.name} 
            games={games.filter(g => g.console_id === console.id)} 
            onSelect={onSelectGame} 
          />
        ))}

        {/* Popular Section */}
        <GameRow 
          title="Trending Now" 
          games={games.sort((a,b) => b.popularity - a.popularity).slice(0, 5)} 
          onSelect={onSelectGame} 
        />
      </div>
    </motion.div>
  );
}

function GameRow({ title, games, onSelect }: { title: string, games: Game[], onSelect: (g: Game) => void }) {
  if (games.length === 0) return null;

  return (
    <section className="space-y-6">
      <h3 className="text-xl font-black tracking-tight uppercase italic flex items-center justify-between group cursor-pointer">
        <span className="flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          {title}
        </span>
        <ChevronRight size={24} className="text-primary group-hover:translate-x-1 transition-transform" />
      </h3>
      <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
        {games.map(g => (
          <motion.div 
            key={g.id} 
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(g)}
            className="flex-shrink-0 w-44 space-y-3 cursor-pointer group"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-xl group-hover:shadow-primary/20 transition-all relative">
              <img src={g.cover_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={g.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="w-full bg-primary text-white text-[10px] font-black py-2 rounded-lg text-center uppercase tracking-widest">
                  Play Now
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black truncate uppercase tracking-tighter group-hover:text-primary transition-colors">{g.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/40 font-bold uppercase">{g.console_name}</p>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star size={10} fill="currentColor" />
                  <span className="text-[10px] font-bold">4.9</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function GameDetailView({ game, onBack }: { game: Game, onBack: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handlePlay = () => {
    setIsDownloading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          alert("ROM Downloaded! Starting Emulator...");
          setIsDownloading(false);
        }, 500);
      }
    }, 100);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-bg-dark z-[60] overflow-y-auto no-scrollbar"
    >
      <div className="relative h-80">
        <img src={game.cover_url} className="w-full h-full object-cover" alt={game.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent" />
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-8 -mt-12 space-y-8 pb-32">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Classic</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <span className="ml-1 text-xs text-white/40 font-bold">4.9 (12k)</span>
            </div>
          </div>
          <h1 className="text-4xl font-black leading-none tracking-tighter uppercase italic">{game.title}</h1>
          <div className="flex items-center gap-4 text-white/40 text-xs font-bold uppercase">
            <div className="flex items-center gap-1"><Gamepad2 size={14} /> {game.console_name}</div>
            <div className="flex items-center gap-1"><History size={14} /> 1998</div>
          </div>
        </div>

        <button 
          onClick={handlePlay}
          disabled={isDownloading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2"><Download size={20} className="animate-bounce" /> DOWNLOADING...</div>
              <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-100" style={{ width: `${downloadProgress}%` }} />
              </div>
            </div>
          ) : (
            <><Play size={24} fill="currentColor" /> PLAY NOW</>
          )}
        </button>

        <div className="space-y-4">
          <h2 className="text-xl font-black tracking-tight uppercase italic">About this game</h2>
          <p className="text-white/60 leading-relaxed text-sm">
            {game.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Genre</p>
            <p className="font-bold text-sm">Action-Adventure</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-1">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">File Size</p>
            <p className="font-bold text-sm">32 MB</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
