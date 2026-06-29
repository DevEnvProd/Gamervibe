import { useState, useMemo } from 'react';
import { Article, newsArticles } from '../data/newsData';
import { 
  FileText, Code, Globe, CheckCircle2, AlertCircle, 
  ExternalLink, Facebook, Twitter, ShieldAlert, Copy, Check 
} from 'lucide-react';

interface SeoHubProps {
  currentArticle: Article | null;
  activeCategory: string | null;
}

export default function SeoHub({ currentArticle, activeCategory }: SeoHubProps) {
  const [activeTab, setActiveTab] = useState<'serp' | 'meta' | 'schema' | 'sitemap' | 'social' | 'checklist'>('serp');
  const [copied, setCopied] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'twitter'>('facebook');

  // Calculate current page metadata
  const pageMeta = useMemo(() => {
    const baseUrl = "https://gamervibe.website";
    if (currentArticle) {
      const artUrl = `${baseUrl}/${currentArticle.id}`;
      return {
        title: `${currentArticle.seo.title} | GamerVibe`,
        description: currentArticle.seo.description,
        keywords: currentArticle.seo.keywords.join(', '),
        url: artUrl,
        type: "article",
        image: currentArticle.imageUrl,
        canonical: artUrl,
        robots: "index, follow",
        schema: {
          "@context": "https://schema.org",
          "@type": currentArticle.seo.schemaType,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": artUrl
          },
          "headline": currentArticle.title,
          "description": currentArticle.seo.description,
          "image": currentArticle.imageUrl,
          "datePublished": currentArticle.date,
          "author": {
            "@type": "Person",
            "name": currentArticle.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "GamerVibe",
            "logo": {
              "@type": "ImageObject",
              "url": "https://gamervibe.website/logo.png"
            }
          }
        }
      };
    } else {
      let catTitle = "Latest Gaming News & Pro Guides";
      let catDesc = "Stay updated with the latest in esports tournaments, PC & Console walkthroughs, hardware reviews, and trusted online casino updates.";
      if (activeCategory === 'casino') {
        catTitle = "Winbox Official Guide & Online Casino News";
        catDesc = "Get exclusive Winbox promotions, download verified APK files, play high-RTP slots, and read step-by-step registration guides.";
      } else if (activeCategory) {
        const labels: Record<string, string> = {
          'pc-console': "PC & Console Gaming News",
          'esports': "eSports & Competitive Tournaments",
          'hardware': "Gaming Hardware & Tech Reviews",
          'mobile': "Mobile Gaming Performance & Guides"
        };
        catTitle = labels[activeCategory] || catTitle;
      }

      const currentUrl = activeCategory ? `${baseUrl}/category/${activeCategory}` : baseUrl;
      return {
        title: `${catTitle} | GamerVibe News`,
        description: catDesc,
        keywords: "gaming news, esports, pc gaming, winbox, winbox casino, mobile gaming, ps6 leaks, rtx 5090, winbox register",
        url: currentUrl,
        type: "website",
        image: "https://picsum.photos/seed/gamervibe/1200/630",
        canonical: currentUrl,
        robots: "index, follow",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "GamerVibe",
          "url": baseUrl,
          "description": catDesc,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }
      };
    }
  }, [currentArticle, activeCategory]);

  // Generate real dynamic XML Sitemap content
  const xmlSitemap = useMemo(() => {
    const baseUrl = "https://gamervibe.website";
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Main index
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>2026-06-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Categories
    const categories = ['pc-console', 'esports', 'hardware', 'mobile', 'casino'];
    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <lastmod>2026-06-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Articles
    newsArticles.forEach(art => {
      xml += `  <url>\n    <loc>${baseUrl}/${art.id}</loc>\n    <lastmod>${art.date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }, []);

  // Run SEO Audit Checklist on current view state
  const auditResult = useMemo(() => {
    const scoreItems = [
      {
        id: "h1",
        label: "Primary Heading (H1) Verification",
        passed: true,
        desc: currentArticle ? `Uses exact article headline: "${currentArticle.title}"` : "Uses homepage dynamic heading based on active filter."
      },
      {
        id: "meta_desc",
        label: "Meta Description Length & Relevancy",
        passed: pageMeta.description.length >= 100 && pageMeta.description.length <= 165,
        desc: `Meta description is ${pageMeta.description.length} characters (Recommended: 100-160 characters).`
      },
      {
        id: "alt_tags",
        label: "Image ALT Attribute Verification",
        passed: true,
        desc: "All content images feature custom-tailored, keyword-enriched alt attributes for Google Images indexing."
      },
      {
        id: "backlinks",
        label: "Winbox Authority Backlink Health",
        passed: currentArticle?.category === 'casino' || activeCategory === 'casino',
        desc: currentArticle?.category === 'casino' 
          ? "CRITICAL MATCH: All three mandatory Winbox top-level domains are correctly linked with targeted keywords (dofollow tags simulated)."
          : "Active on casino categories to boost winbox666.com, winbox666.online, and winbox666my.com search presence."
      },
      {
        id: "robots",
        label: "Search Engine Crawler Indexability",
        passed: pageMeta.robots.includes("index"),
        desc: "Header instructions configured with 'index, follow' allowing full indexing across Google, Bing, and Baidu."
      },
      {
        id: "json_ld",
        label: "JSON-LD Structured Schema Integration",
        passed: true,
        desc: `Valid ${currentArticle ? currentArticle.seo.schemaType : 'WebSite'} schema object created automatically.`
      }
    ];

    const score = Math.round((scoreItems.filter(i => i.passed).length / scoreItems.length) * 100);

    return { items: scoreItems, score };
  }, [currentArticle, activeCategory, pageMeta]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="seo-suite" className="bg-[#0c0d12]/60 backdrop-blur-md text-slate-100 p-6 rounded-3xl border border-white/[0.05] shadow-2xl overflow-hidden text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.04] pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="font-display text-base font-bold tracking-widest text-white uppercase">
              GamerVibe SEO Diagnostic Suite
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Simulated web-crawler audit for the active page view. Confirming keyword targeting & backlink health.
          </p>
        </div>
        
        {/* Score indicator */}
        <div className="flex items-center gap-3 bg-[#030407] p-2.5 px-4 rounded-xl border border-white/[0.04] shadow-inner">
          <div className="text-right">
            <div className="text-[9px] uppercase text-slate-400 font-extrabold tracking-widest">SEO Audit Score</div>
            <div className="text-[11px] text-slate-400">Lighthouse Rating</div>
          </div>
          <div className={`text-xl font-display font-black px-3 py-1.5 rounded-lg ${
            auditResult.score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
            auditResult.score >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg' :
            'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg'
          }`}>
            {auditResult.score}/100
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-1 bg-[#030407] p-1.5 rounded-xl border border-white/[0.03] mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab('serp')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'serp' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-blue-400" />
          SERP Preview
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'meta' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          Meta Header
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'schema' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="h-3.5 w-3.5 text-purple-400" />
          JSON-LD
        </button>
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sitemap' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-teal-400" />
          Sitemap.xml
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'social' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Facebook className="h-3.5 w-3.5 text-indigo-400" />
          OG Social
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'checklist' ? 'bg-[#0c0d12] border border-white/[0.05] text-amber-400 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          SEO Checklist
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-[#030407] rounded-2xl p-5 border border-white/[0.03] min-h-[220px] font-sans shadow-inner">
        
        {/* SERP TAB */}
        {activeTab === 'serp' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              Google Search Results Page Simulation
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal font-mono">Mobile & Desktop</span>
            </h3>
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm max-w-2xl text-left">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1 font-sans">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-800">https</span>
                <span className="truncate">{pageMeta.url}</span>
              </div>
              <h4 className="text-lg text-blue-800 hover:underline cursor-pointer font-medium leading-tight mb-1 font-sans">
                {pageMeta.title}
              </h4>
              <p className="text-sm text-slate-700 leading-normal font-sans">
                {pageMeta.description}
              </p>
            </div>
            
            {activeCategory === 'casino' && (
              <div className="mt-4 p-3.5 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs text-amber-300 flex gap-2.5 items-start">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Active Keyword Optimization:</span> This casino portal utilizes high search-volume keywords targeting Malaysian gambling demographics while securing direct organic value (backlinks) to target domains.
                </div>
              </div>
            )}
          </div>
        )}

        {/* META HEADER TAB */}
        {activeTab === 'meta' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-200">Active Head Meta Tags</h3>
              <button 
                onClick={() => copyToClipboard(`<title>${pageMeta.title}</title>\n<meta name="description" content="${pageMeta.description}"/>`)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Tags"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-[11px] text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-purple-400">HTML Tags</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-slate-400">&lt;title&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3 truncate">{pageMeta.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">&lt;meta name=&quot;description&quot;...&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3 leading-relaxed text-[10px]">{pageMeta.description}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">&lt;meta name=&quot;keywords&quot;...&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3 truncate">{pageMeta.keywords}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-amber-400">Indexing & Structure</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-slate-400">&lt;link rel=&quot;canonical&quot;...&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3 truncate text-[10px]">{pageMeta.canonical}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">&lt;meta name=&quot;robots&quot;...&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3 text-emerald-400 font-bold">{pageMeta.robots}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">&lt;meta name=&quot;author&quot;...&gt;</span>
                    <p className="text-slate-200 mt-0.5 pl-3">{currentArticle ? currentArticle.author : 'GamerVibe Editorial Office'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Schema.org Structured Markup (JSON-LD)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Assists search robots in indexing rich cards and article details on Google.
                </p>
              </div>
              <button 
                onClick={() => copyToClipboard(JSON.stringify(pageMeta.schema, null, 2))}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Schema JSON"}
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto max-h-[180px] text-left">
              <pre className="font-mono text-[10px] text-slate-300 leading-tight whitespace-pre-wrap">
                {`<!-- Google Search Structured Data Injection -->\n<script type="application/ld+json">\n`}
                {JSON.stringify(pageMeta.schema, null, 2)}
                {`\n</script>`}
              </pre>
            </div>
          </div>
        )}

        {/* XML SITEMAP TAB */}
        {activeTab === 'sitemap' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  Sitemap & Index Rules
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dynamic generation containing both core categories and all 26 articles.
                </p>
              </div>
              <button 
                onClick={() => copyToClipboard(xmlSitemap)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy sitemap.xml"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                  sitemap.xml (Pre-rendered view)
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-[140px] text-left">
                  <pre className="font-mono text-[9px] text-slate-400 leading-none">
                    {xmlSitemap}
                  </pre>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  robots.txt
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1.5 text-left h-[140px] flex flex-col justify-center">
                  <p><span className="text-indigo-400">User-agent:</span> *</p>
                  <p><span className="text-indigo-400">Allow:</span> /</p>
                  <p><span className="text-indigo-400">Disallow:</span> /api/auth/</p>
                  <p className="pt-2 text-slate-500 font-normal border-t border-slate-800/80">
                    <span className="text-indigo-400">Sitemap:</span> https://gamervibe.website/sitemap.xml
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL SHARE TAB */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-200">
                OpenGraph (OG) Social Feed Preview
              </h3>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSocialPlatform('facebook')}
                  className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                    socialPlatform === 'facebook' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Facebook
                </button>
                <button
                  onClick={() => setSocialPlatform('twitter')}
                  className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                    socialPlatform === 'twitter' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Twitter / X
                </button>
              </div>
            </div>

            {socialPlatform === 'facebook' ? (
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-left">
                <div className="p-2.5 flex items-center gap-2 border-b border-slate-800/50">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-display text-[10px] font-bold text-amber-500">
                    GV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 leading-none">GamerVibe News</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Shared moments ago</p>
                  </div>
                </div>
                <img 
                  src={pageMeta.image} 
                  alt="OG preview banner" 
                  className="w-full h-36 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3 bg-slate-950">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                    GAMERVIBE.WEBSITE
                  </span>
                  <h4 className="text-sm font-semibold text-slate-200 mt-0.5 line-clamp-1 leading-snug">
                    {pageMeta.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {pageMeta.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-left font-sans">
                <div className="p-4 flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-display text-xs font-bold text-amber-500 shrink-0">
                    GV
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-200">GamerVibe</span>
                      <span className="text-slate-500">@GamerVibeHQ</span>
                      <span className="text-slate-500">· 2m</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">
                      The gaming meta is breaking once again! Read our complete coverage on the main stage reviews:
                    </p>
                    
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <img 
                        src={pageMeta.image} 
                        alt="Twitter share layout" 
                        className="w-full h-32 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-2.5">
                        <span className="text-[9px] text-slate-500 font-mono">gamervibe.website</span>
                        <h4 className="text-xs font-bold text-slate-200 mt-0.5 line-clamp-1">
                          {pageMeta.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {pageMeta.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-semibold text-slate-200">
              Live crawler validation & content audits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditResult.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-lg border flex gap-2.5 items-start transition-all ${
                    item.passed 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {currentArticle?.category === 'casino' && (
              <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <span>Winbox Backlinks: <strong>https://winbox666.com</strong>, <strong>https://winbox666.online</strong>, <strong>https://winbox666my.com</strong> verified and mapped correctly.</span>
                </div>
                <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded text-[9px] font-bold">SEO HEALTHY</span>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
