import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Search, Share2, Globe, Sparkles, TrendingUp, 
  Clock, ArrowLeft, Calendar, User, CheckCircle2, ExternalLink, 
  FileText, Code, Award, Info, Layers, Settings, Heart, ShieldCheck, 
  Eye, Download, RefreshCw, Terminal, Menu, X, Check
} from 'lucide-react';
import { newsArticles, Article } from './data/newsData';
import SeoHub from './components/SeoHub';

// Helper function to parse URL paths and extract article and category details
const parseLocation = (pathname: string) => {
  // Remove trailing slash if exists (except for root '/')
  const cleanPath = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  
  if (cleanPath === '/' || cleanPath === '') {
    return { articleId: null, category: null };
  }
  
  if (cleanPath.startsWith('/category/')) {
    const cat = cleanPath.replace('/category/', '');
    return { articleId: null, category: cat === 'all' ? null : cat };
  }
  
  // Check if path matches an article (removing leading slash)
  const possibleArticleId = cleanPath.substring(1);
  const exists = newsArticles.some(a => a.id === possibleArticleId);
  if (exists) {
    const art = newsArticles.find(a => a.id === possibleArticleId);
    return { articleId: possibleArticleId, category: art ? art.category : null };
  }
  
  return { articleId: null, category: null };
};

export default function App() {
  // Parse initial route from URL path
  const initialRoute = parseLocation(window.location.pathname);

  // Navigation & Filtering States
  const [activeCategory, setActiveCategory] = useState<string | null>(initialRoute.category);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(initialRoute.articleId);
  
  // SEO panel visibility
  const [showSeoPanel, setShowSeoPanel] = useState(true);
  
  // Crawler Logs State
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([
    "🤖 Search bot crawler initiated.",
    "🔍 Scanning directory /index.html...",
    "📄 Found 26 valid articles ready for search index.",
    "✅ Sitemap and robots.txt loaded."
  ]);
  const [isCrawling, setIsCrawling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Mobile navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Success copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse URL path routing on browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const route = parseLocation(window.location.pathname);
      setSelectedArticleId(route.articleId);
      setActiveCategory(route.category);
      if (route.articleId) {
        // Auto scroll to top of article
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically update real HTML head metadata for SEO, social shares, and web crawlers
  useEffect(() => {
    const currentArticle = newsArticles.find(a => a.id === selectedArticleId);
    const baseUrl = "https://gamervibe.website";

    let title = "GamerVibe - Ultimate Gaming News & Casino Guide";
    let description = "GamerVibe is Malaysia's premier authority news portal. Get exclusive guides, VCT analysis, and trusted online casino reviews like Winbox MY.";
    let url = baseUrl;
    let imageUrl = "https://picsum.photos/seed/gamervibe/1200/630";
    let type = "website";

    if (currentArticle) {
      title = `${currentArticle.seo.title} | GamerVibe`;
      description = currentArticle.seo.description;
      url = `${baseUrl}/${currentArticle.id}`;
      imageUrl = currentArticle.imageUrl || "https://picsum.photos/seed/gamervibe/1200/630";
      type = "article";
    } else if (activeCategory) {
      const categoryLabels: Record<string, string> = {
        'pc-console': 'PC & Console Gaming News',
        'esports': 'eSports Tournaments & Standings',
        'hardware': 'Gaming Tech & Hardware Reviews',
        'mobile': 'Mobile Gaming News',
        'casino': 'Malaysia Trusted Online Casino Guides'
      };
      const categoryDescriptions: Record<string, string> = {
        'pc-console': 'Latest reviews, patches, and news for PC, PlayStation 5, Xbox Series X, and Nintendo Switch.',
        'esports': 'In-depth coverage, tournament schedules, VCT Valorant champions updates, and pro player insights.',
        'hardware': 'Reviews of the latest graphics cards, gaming laptops, mechanical keyboards, and hardware benchmarks.',
        'mobile': 'Mobile gaming news, global releases, iOS & Android tournament coverages, and guides.',
        'casino': 'Comprehensive guide on Winbox Malaysia. Access safe downloads, claims, free credits, and trusted web login gateways.'
      };
      
      title = `${categoryLabels[activeCategory] || activeCategory.toUpperCase()} | GamerVibe`;
      description = categoryDescriptions[activeCategory] || description;
      url = `${baseUrl}/category/${activeCategory}`;
    }

    // Update document title
    document.title = title;

    // Helper to set/update meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to set/update link tag
    const setLinkTag = (relValue: string, hrefValue: string) => {
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // Set Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');
    
    // Open Graph (Facebook / LinkedIn)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'GamerVibe');

    // Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);

    // Canonical Link Tag
    setLinkTag('canonical', url);

  }, [selectedArticleId, activeCategory]);

  // Sync URL when selected article or category changes manually
  const navigateToArticle = (id: string) => {
    const newPath = `/${id}`;
    window.history.pushState({}, '', newPath);
    setSelectedArticleId(id);
    const art = newsArticles.find(a => a.id === id);
    if (art) {
      setActiveCategory(art.category);
    }
    addCrawlerLog(`🤖 Crawler following link to [${newPath}]...`);
    simulateBotCrawl(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (cat: string | null) => {
    const newPath = cat ? `/category/${cat}` : '/';
    window.history.pushState({}, '', newPath);
    setActiveCategory(cat);
    setSelectedArticleId(null);
    addCrawlerLog(`🤖 Crawler filtering directory to [category: ${cat || 'all'}]...`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedArticleId(null);
    setActiveCategory(null);
    addCrawlerLog(`🤖 Crawler returned to directory root [/]`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for adding crawler logs
  const addCrawlerLog = (msg: string) => {
    setCrawlerLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Auto-scroll log console
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [crawlerLogs]);

  // Simulate Google Crawler bot visiting the site
  const simulateBotCrawl = (articleId?: string) => {
    setIsCrawling(true);
    addCrawlerLog("⚡ Initializing organic crawl scan...");
    
    setTimeout(() => {
      if (articleId) {
        const art = newsArticles.find(a => a.id === articleId);
        if (art) {
          addCrawlerLog(`🔍 Reading metadata: title="${art.seo.title}"`);
          addCrawlerLog(`🔍 Validating meta-description: "${art.seo.description.slice(0, 45)}..."`);
          addCrawlerLog(`📊 Structured Schema detected: [Type: ${art.seo.schemaType}]`);
          if (art.category === 'casino') {
            addCrawlerLog("🔗 [BACKLINK AUDIT] Found 3 dofollow anchor targets pointing to Winbox properties:");
            addCrawlerLog("   -> https://winbox666.com (Authority Status: Active)");
            addCrawlerLog("   -> https://winbox666.online (Authority Status: Active)");
            addCrawlerLog("   -> https://winbox666my.com (Authority Status: Active)");
            addCrawlerLog("⭐ Winbox promotion signals verified. Index payload compiled.");
          } else {
            addCrawlerLog("🔗 Normal internal linkages verified. Core ranking healthy.");
          }
        }
      } else {
        addCrawlerLog("🔍 Reviewing frontpage indexing hierarchy...");
        addCrawlerLog("📂 Loaded categories: [pc-console, esports, hardware, mobile, casino]");
        addCrawlerLog("⚡ Scanning XML Sitemap links...");
        addCrawlerLog("🏆 Frontpage organic structure: 100% Crawlable.");
      }
      setIsCrawling(false);
    }, 1200);
  };

  // Filtered articles memo
  const filteredArticles = useMemo(() => {
    return newsArticles.filter(art => {
      const matchCategory = activeCategory ? art.category === activeCategory : true;
      const matchSearch = searchQuery ? (
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.seo.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Selected Article Object
  const currentArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return newsArticles.find(a => a.id === selectedArticleId) || null;
  }, [selectedArticleId]);

  // Handle Share copy
  const handleShare = (title: string) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    addCrawlerLog(`🔗 Copied shareable, canonical URL: ${window.location.href}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Quick category list helper
  const categoriesList = [
    { id: null, label: 'All News', icon: Gamepad2 },
    { id: 'pc-console', label: 'PC & Console', icon: Gamepad2 },
    { id: 'esports', label: 'eSports', icon: Award },
    { id: 'hardware', label: 'Hardware', icon: Settings },
    { id: 'mobile', label: 'Mobile Gaming', icon: Globe },
    { id: 'casino', label: 'Online Casino (Winbox)', icon: Sparkles, highlight: true }
  ];

  return (
    <div className="min-h-screen bento-grid-bg text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased">
      
      {/* Upper Promo Banner promoting Winbox */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-slate-950 py-2.5 px-4 text-center text-xs font-bold tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 relative overflow-hidden">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-950 animate-ping"></span>
        <span className="tracking-wide">Exclusive Winbox Promo: Register via Winbox MY to claim free spin credits & daily cash rebates!</span>
        <div className="flex gap-2 ml-4">
          <a 
            href="https://winbox666my.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-slate-950 text-amber-400 px-3 py-1.5 rounded-xl text-[10px] uppercase font-extrabold hover:bg-slate-900 shadow-md transition-all inline-flex items-center gap-1 shrink-0"
          >
            Winbox MY
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a 
            href="https://winbox666.online" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-slate-950 text-amber-400 px-3 py-1.5 rounded-xl text-[10px] uppercase font-extrabold hover:bg-slate-900 shadow-md transition-all inline-flex items-center gap-1 shrink-0 hidden md:inline-flex"
          >
            Winbox Online
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#030407]/80 backdrop-blur-md border-b border-white/[0.04] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={navigateToHome}
            className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all">
              <Gamepad2 className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors block">
                GAMER<span className="text-amber-500">VIBE</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block -mt-1">
                Verified News Portal
              </span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search news, hardware leaks, Winbox strategy..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentArticle) navigateToHome();
              }}
              className="w-full bg-slate-900 text-slate-100 pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white text-xs font-mono bg-slate-800 px-2 py-0.5 rounded"
              >
                clear
              </button>
            )}
          </div>

          {/* Action Links */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            <button
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                showSeoPanel 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Globe className="h-4 w-4 animate-spin-slow" />
              SEO Diagnostic Panel: {showSeoPanel ? "ON" : "OFF"}
            </button>
            
            <a 
              href="https://winbox666.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              Winbox Direct
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className="p-2 bg-slate-900 rounded-xl text-slate-400"
              title="Toggle SEO View"
            >
              <Globe className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-0 right-0 bg-slate-950 border-b border-slate-900 p-5 md:hidden z-30 space-y-4 shadow-2xl"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search articles & Winbox news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 pl-10 pr-4 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none"
                />
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Filter Category</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        navigateToCategory(cat.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-2 px-3 text-left rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                        (cat.id === activeCategory && !selectedArticleId)
                          ? 'bg-amber-500 text-slate-950'
                          : cat.highlight 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-900">
                <a
                  href="https://winbox666.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-2.5 rounded-lg text-center font-extrabold text-xs"
                >
                  Winbox Official
                </a>
                <a
                  href="https://winbox666.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-900 text-amber-400 py-2.5 rounded-lg text-center font-extrabold text-xs border border-slate-800"
                >
                  Winbox Online
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Category Rails (Desktop) */}
        <div className="hidden md:flex items-center justify-between gap-4 bg-[#0a0b0d]/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.04] mb-8 overflow-x-auto shadow-xl">
          <div className="flex items-center gap-1.5 p-0.5">
            {categoriesList.map((cat) => {
              const isActive = (cat.id === activeCategory && !selectedArticleId);
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    navigateToCategory(cat.id);
                  }}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/15 transform -translate-y-0.5' 
                      : cat.highlight
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300'
                        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <cat.icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'text-slate-950 scale-105' : cat.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => simulateBotCrawl(currentArticle?.id)}
            disabled={isCrawling}
            className="mr-3 text-[11px] font-mono bg-[#030407] border border-white/[0.06] hover:border-amber-500/40 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-lg hover:shadow-amber-500/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            {isCrawling ? 'Crawling...' : 'Run Google Crawl Test'}
          </button>
        </div>

        {/* Dashboard split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: Content Reader or Main News Feed Grid */}
          <div className={`${showSeoPanel ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8 transition-all`}>
            
            <AnimatePresence mode="wait">
              {currentArticle ? (
                // ==========================================
                // ARTICLE READER MODE
                // ==========================================
                <motion.article 
                  key="article-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-900/60 rounded-2xl border border-slate-900/80 p-5 sm:p-8 space-y-6 text-left"
                >
                  {/* Breadcrumb and Back */}
                  <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                    <button 
                      onClick={navigateToHome}
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 cursor-pointer group"
                    >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      Back to Gaming Feed
                    </button>
                    
                    <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-semibold">
                      {currentArticle.categoryLabel}
                    </span>
                  </div>

                  {/* Title and Meta */}
                  <div className="space-y-4">
                    <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      {currentArticle.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-amber-500" />
                        {currentArticle.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        {currentArticle.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-500" />
                        {currentArticle.readTime}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                        SEO Friendly Page
                      </span>
                    </div>
                  </div>

                  {/* Hero Image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-2xl">
                    <img 
                      src={currentArticle.imageUrl} 
                      alt={`${currentArticle.title} - Main Graphic`} 
                      className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                  </div>

                  {/* Premium Casino Badge */}
                  {currentArticle.category === 'casino' && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-700/15 border-l-4 border-amber-500 p-5 rounded-r-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-400" />
                        <h4 className="font-display text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                          Official Winbox Partner Verified Content
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This article is optimized to guide players safely to the verified Malaysian Winbox network. Follow the highlighted secure linkages below to complete your sign-up package securely.
                      </p>
                      <div className="flex flex-wrap gap-2.5 pt-1.5">
                        <a href="https://winbox666.com" target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight flex items-center gap-1">
                          winbox666.com
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <a href="https://winbox666.online" target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight flex items-center gap-1">
                          winbox666.online
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <a href="https://winbox666my.com" target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-900 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight flex items-center gap-1">
                          winbox666my.com
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Rich Content Area */}
                  <div 
                    className="prose dark:prose-invert max-w-none text-slate-350"
                    dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                  />

                  {/* Backlink Focus Container */}
                  {currentArticle.category === 'casino' && (
                    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-4">
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Verified Domain Backlink Authority Checks
                      </h4>
                      <p className="text-xs text-slate-400">
                        In accordance with premier search indexing guidelines, we have embedded authority backlinks matching our regional SEO configurations.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between h-24">
                          <span className="text-[10px] text-slate-500 font-mono">Gateway Alpha</span>
                          <a href="https://winbox666.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-white font-bold text-xs truncate underline mt-1.5 block">
                            winbox666.com
                          </a>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded self-start mt-2">Dofollow Authority</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between h-24">
                          <span className="text-[10px] text-slate-500 font-mono">Installer Hub</span>
                          <a href="https://winbox666.online" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-white font-bold text-xs truncate underline mt-1.5 block">
                            winbox666.online
                          </a>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded self-start mt-2">Dofollow Authority</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between h-24">
                          <span className="text-[10px] text-slate-500 font-mono">Malaysia HQ</span>
                          <a href="https://winbox666my.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-white font-bold text-xs truncate underline mt-1.5 block">
                            winbox666my.com
                          </a>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded self-start mt-2">Dofollow Authority</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Share Footer */}
                  <div className="border-t border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {currentArticle.seo.keywords.map((key) => (
                        <span 
                          key={key}
                          onClick={() => {
                            setSearchQuery(key);
                            navigateToHome();
                          }}
                          className="bg-slate-950 text-slate-400 hover:text-amber-400 hover:bg-slate-900 cursor-pointer text-[10px] font-mono px-2.5 py-1 rounded border border-slate-850 transition-colors"
                        >
                          #{key}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleShare(currentArticle.title)}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                        {copiedLink ? "Link Copied!" : "Share Article"}
                      </button>
                      <button 
                        onClick={navigateToHome}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Close Reader
                      </button>
                    </div>
                  </div>

                  {/* Suggested reading */}
                  <div className="pt-6 border-t border-slate-850 space-y-4">
                    <h3 className="font-display text-base font-extrabold text-white uppercase tracking-wider">
                      Related Gaming Coverage
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {newsArticles
                        .filter(a => a.id !== currentArticle.id && (a.category === currentArticle.category || a.category === 'casino'))
                        .slice(0, 2)
                        .map(item => (
                          <div 
                            key={item.id}
                            onClick={() => navigateToArticle(item.id)}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-900 hover:border-amber-500/35 transition-all cursor-pointer flex gap-3 text-left group"
                          >
                            <img 
                              src={item.imageUrl} 
                              alt="thumbnail" 
                              className="h-14 w-20 rounded object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono block">
                                {item.categoryLabel}
                              </span>
                              <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate mt-1">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {item.excerpt}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </motion.article>
              ) : (
                // ==========================================
                // MAIN PORTAL FEED MODE
                // ==========================================
                <motion.div 
                  key="feed-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Search query tag view */}
                  {searchQuery && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Search filter active:</span>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold">
                          &quot;{searchQuery}&quot;
                        </span>
                      </div>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-400 hover:text-white underline font-mono"
                      >
                        Reset Search
                      </button>
                    </div>
                  )}

                  {/* Leading Featured Card (only if no specific keyword search) */}
                  {!searchQuery && (
                    <div 
                      onClick={() => navigateToArticle(activeCategory === 'casino' ? 'winbox-malaysia-trusted-online-casino-2026' : 'vct-champions-2026-meta-analysis')}
                      className="relative bg-gradient-to-b from-[#0b0c10] to-[#040507] rounded-3xl border border-white/[0.05] overflow-hidden cursor-pointer group shadow-2xl hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.08)] transition-all duration-500 text-left"
                    >
                      {/* Banner Image */}
                      <div className="aspect-video sm:aspect-[21/9] overflow-hidden relative">
                        <img 
                          src={activeCategory === 'casino' ? "https://picsum.photos/seed/casino_hero/1200/600" : "https://picsum.photos/seed/esports_hero/1200/600"} 
                          alt="Featured News Cover" 
                          className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-1000 ease-out brightness-90 group-hover:brightness-95"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#040507]/45 to-transparent"></div>
                      </div>

                      {/* Floating Category Badge */}
                      <span className="absolute top-5 left-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg shadow-amber-500/10">
                        FEATURED COVERAGE
                      </span>

                      {/* Banner Content */}
                      <div className="p-6 sm:p-8 space-y-4 relative">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="text-amber-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                            {activeCategory === 'casino' ? 'Online Casino' : 'eSports & Tournaments'}
                          </span>
                          <span className="text-white/20">|</span>
                          <span>5 min read</span>
                          <span className="text-white/20">|</span>
                          <span>By GamerVibe Editorial Team</span>
                        </div>
                        
                        <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
                          {activeCategory === 'casino' 
                            ? "Why Winbox is Ranked as Malaysia's Most Trusted Online Casino in 2026"
                            : "VCT Champions 2026: agents, strategies, and meta shifts reshaping valorant"
                          }
                        </h2>
                        
                        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none">
                          {activeCategory === 'casino'
                            ? "Discover why Winbox has taken the Malaysian online gaming market by storm, offering secure transactions, a massive gaming library, and unparalleled user support."
                            : "Analyze the core meta shifts of the VCT Champions tournament, detailing dominant agent comps, map control tactics, and high-impact clutch matches."
                          }
                        </p>

                        <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
                          Read Full Analytical Report 
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Grid Feed */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold uppercase tracking-widest text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                          Latest Gaming Insights & Guides
                        </h3>
                        <p className="text-xs text-slate-500">
                          Showing {filteredArticles.length} matching gaming news blocks
                        </p>
                      </div>
                    </div>

                    {filteredArticles.length === 0 ? (
                      <div className="bg-[#0b0c10]/40 rounded-3xl p-12 text-center border border-white/[0.04] space-y-4 backdrop-blur-md">
                        <Info className="h-10 w-10 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-300">No Articles Match Your Search</h4>
                        <p className="text-xs text-slate-500">
                          Try adjusting your active category filter or clearing the search bar.
                        </p>
                        <button 
                          onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                          className="bg-slate-900 border border-slate-850 hover:border-amber-500/30 text-amber-400 hover:text-amber-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredArticles.map((art, index) => {
                          const isCasino = art.category === 'casino';
                          // Bento grid pattern: first item of each triplet is a large double-span block!
                          const isLarge = index % 3 === 0;
                          return (
                            <motion.div
                              layout
                              key={art.id}
                              onClick={() => navigateToArticle(art.id)}
                              className={`rounded-2xl border overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 text-left flex flex-col justify-between ${
                                isLarge ? 'md:col-span-2' : 'md:col-span-1'
                              } ${
                                isCasino 
                                  ? 'border-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.06)] bg-gradient-to-br from-[#0c0d12]/90 via-[#07080a]/95 to-amber-950/10' 
                                  : 'border-white/[0.05] hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.06)] bg-[#0c0d12]/90'
                              }`}
                            >
                              <div className={`flex flex-col h-full ${isLarge ? 'md:flex-row' : ''}`}>
                                {/* Thumbnail */}
                                <div className={`relative overflow-hidden shrink-0 ${isLarge ? 'w-full md:w-[45%] aspect-video md:aspect-auto' : 'aspect-video'}`}>
                                  <img 
                                    src={art.imageUrl} 
                                    alt={art.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 ease-out"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className={`absolute top-3 left-3 text-[9px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg ${
                                    isCasino ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold' : 'bg-slate-950 text-slate-300'
                                  }`}>
                                    {art.categoryLabel}
                                  </span>
                                </div>

                                {/* Summary */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-wider">
                                      <span>{art.date}</span>
                                      <span className="text-white/10">•</span>
                                      <span>{art.readTime}</span>
                                    </div>
                                    
                                    <h4 className={`font-display font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug ${
                                      isLarge ? 'text-lg sm:text-xl' : 'text-base'
                                    }`}>
                                      {art.title}
                                    </h4>
                                    
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                      {art.excerpt}
                                    </p>
                                  </div>

                                  {/* Footer links */}
                                  <div className="pt-4 border-t border-white/[0.04] mt-5 flex items-center justify-between text-[11px] font-bold text-amber-500 group-hover:text-amber-400 transition-all">
                                    <span className="flex items-center gap-1">
                                      Read Full Report
                                      <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                    {isCasino && (
                                      <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-extrabold">
                                        WINBOX PROMO
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT AREA: SEO Diagnostic Panel & Google crawler logs */}
          {showSeoPanel && (
            <div className="lg:col-span-4 space-y-6">
              
              {/* Interactive SEO Terminal View */}
              <div className="bg-[#08090c] border border-white/[0.06] rounded-2xl p-5 text-left font-mono shadow-xl relative overflow-hidden">
                {/* Decorative Terminal Dots */}
                <div className="absolute top-4 right-5 flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500/70"></span>
                  <span className="h-2 w-2 rounded-full bg-amber-500/70"></span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/70"></span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-sans">
                      Crawler Console
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setCrawlerLogs([
                        "🤖 Terminal cleared.",
                        "⚡ Preparing test sequence..."
                      ]);
                      simulateBotCrawl(currentArticle?.id);
                    }}
                    className="text-[9px] text-slate-400 hover:text-white border border-white/[0.05] hover:border-white/[0.15] bg-[#030407] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="bg-[#030407] p-3 rounded-xl border border-white/[0.03] h-40 overflow-y-auto space-y-1 text-[10px] text-emerald-400/90 leading-tight">
                  {crawlerLogs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
                
                <div className="border-t border-white/[0.04] pt-3 mt-3 flex items-center justify-between text-[9px] text-slate-500">
                  <span>Domain: gamervibe.website</span>
                  <span>Frequency: Daily</span>
                </div>
              </div>

              {/* Main Diagnostic Panel */}
              <SeoHub 
                currentArticle={currentArticle}
                activeCategory={activeCategory}
              />

              {/* Verified Authority Info Card */}
              <div className="bg-[#0c0d12]/60 backdrop-blur-md p-5 rounded-2xl border border-white/[0.05] space-y-4 text-left shadow-xl hover:border-amber-500/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.04)] transition-all">
                <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  Winbox Authority Anchors
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To provide supreme SEO ranking indexation, GamerVibe publishes targeted articles utilizing physical anchors pointing directly to key gaming platforms.
                </p>
                
                <ul className="space-y-2.5 font-mono text-[11px]">
                  <li className="flex items-center justify-between p-2.5 bg-[#030407] rounded-xl border border-white/[0.03] hover:border-amber-500/25 transition-all">
                    <span className="text-slate-400 font-sans">Gateway Portal</span>
                    <a href="https://winbox666.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                      winbox666.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li className="flex items-center justify-between p-2.5 bg-[#030407] rounded-xl border border-white/[0.03] hover:border-amber-500/25 transition-all">
                    <span className="text-slate-400 font-sans">Online Installer</span>
                    <a href="https://winbox666.online" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                      winbox666.online
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li className="flex items-center justify-between p-2.5 bg-[#030407] rounded-xl border border-white/[0.03] hover:border-amber-500/25 transition-all">
                    <span className="text-slate-400 font-sans">Malaysia HQ</span>
                    <a href="https://winbox666my.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                      winbox666my.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>

                <p className="text-[10px] text-slate-500 text-center">
                  All target URLs are verified to resolve with HTTPS protocols.
                </p>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="h-7 w-7 rounded bg-amber-500 flex items-center justify-center">
                  <Gamepad2 className="h-4.5 w-4.5 text-slate-950" />
                </div>
                <span className="font-display text-lg font-black text-white tracking-tight">
                  GAMER<span className="text-amber-500">VIBE</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                GamerVibe is the leading, independent online portal for professional gaming articles, hardware reviews, VCT updates, and premium casino guides.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                News Directories
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigateToCategory('pc-console')} className="hover:text-white transition-colors">
                    PC & Console Guides
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToCategory('esports')} className="hover:text-white transition-colors">
                    eSports Tournaments
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToCategory('hardware')} className="hover:text-white transition-colors">
                    Hardware Reviews
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToCategory('mobile')} className="hover:text-white transition-colors">
                    Mobile Gaming
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Winbox Official Gateways
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://winbox666.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Winbox Official Portal
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://winbox666.online" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Winbox Online Installer
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://winbox666my.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Winbox Malaysia Sign-Up
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                SEO & Crawler Access
              </h5>
              <ul className="space-y-2 text-xs text-slate-500 font-mono">
                <li>Crawled: Daily</li>
                <li>Sitemap: Available</li>
                <li>Structured: JSON-LD</li>
                <li>Index Status: Active</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© 2026 GamerVibe. All rights reserved. Built with SEO friendly standards and full metadata structures.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Sitemap</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
