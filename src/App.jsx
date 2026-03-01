import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Plus, Search, Globe, LayoutGrid, List, Info } from 'lucide-react';
import ProductDrawer from './components/ProductDrawer';
import CheckoutDrawer from './components/CheckoutDrawer';
import { MENU_CATEGORIES, MENU_ITEMS } from './data';
import { useLanguage } from './LanguageContext';

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsLangOpen(false);
  };

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleAddToCart = (cartItem) => {
    setCart(prev => [...prev, cartItem]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = MENU_ITEMS.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = item.name[lang] || '';
    const desc = item.description[lang] || '';
    return name.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
  });

  return (
    <div className={`min-h-screen pb-32 bg-[#050505] text-white selection:bg-orange-500 selection:text-white ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* Dynamic Background Blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-orange-600/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Modern Top Header */}
      <header className="relative z-50 px-6 pt-8 pb-4 max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl p-1.5 shadow-2xl flex items-center justify-center">
            <img src="/images/logo-Qalaat-Al-Sham.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {lang === 'ar' ? 'قلعة الشام' : 'Qalaat Al-Sham'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{t('openNow') || 'Open Now'}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-all border-white/5"
          >
            <Globe size={18} className="text-gray-300" />
          </button>
          {isLangOpen && (
            <div className={`absolute top-full mt-3 ${lang === 'ar' ? 'left-0' : 'right-0'} bg-[#121212] rounded-2xl shadow-2xl w-40 border border-white/10 overflow-hidden z-[100] animate-slide-up`}>
              {[{ id: 'ar', label: 'العربية' }, { id: 'tr', label: 'Türkçe' }, { id: 'en', label: 'English' }].map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLanguageChange(l.id)}
                  className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors hover:bg-white/5 ${lang === l.id ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 px-6 max-w-4xl mx-auto">

        {/* Sleek Search Container */}
        <div className="mt-6 mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative glass-card rounded-2xl flex items-center px-5 h-14 border-white/10 focus-within:border-orange-500/30 transition-all">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 px-4 text-sm font-medium placeholder:text-gray-600"
              />
              <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-6">
                <button onClick={() => setViewMode('grid')} className={`p-1 transition-colors ${viewMode === 'grid' ? 'text-orange-500' : 'text-gray-600'}`}>
                  <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1 transition-colors ${viewMode === 'list' ? 'text-orange-500' : 'text-gray-600'}`}>
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories (Static Header on Project 2 or Bottom fixed?) Let's do a top scroll too */}
        {!searchQuery && (
          <nav className="mb-12 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 px-1">
              {MENU_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all border ${activeCategory === category.id
                      ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  {category.label[lang].toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Menu Items */}
        <div className="space-y-16">
          {searchQuery ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-4"}>
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} lang={lang} t={t} mode={viewMode} onClick={() => handleProductClick(item)} />
              ))}
            </div>
          ) : (
            MENU_CATEGORIES.map(category => {
              const items = filteredItems.filter(i => i.categoryId === category.id);
              if (items.length === 0) return null;
              return (
                <section key={category.id} id={category.id} className="scroll-mt-24">
                  <div className="flex items-baseline justify-between mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">{category.label[lang]}</h2>
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em]">{items.length} {t('items') || 'ITEMS'}</span>
                  </div>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-x-4 gap-y-8" : "space-y-4"}>
                    {items.map(item => (
                      <MenuCard key={item.id} item={item} lang={lang} t={t} mode={viewMode} onClick={() => handleProductClick(item)} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Bottom Nav / Action Area */}
      <footer className="fixed bottom-6 left-6 right-6 z-50 flex justify-center pointer-events-none">
        <div className="glass-card rounded-[2rem] px-2 py-2 flex items-center gap-2 pointer-events-auto shadow-2xl border-white/10 max-w-md w-full">
          <div className="flex-1 flex px-4">
            {cartItemCount > 0 ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex items-center gap-4 w-full"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <ShoppingBag size={22} className="text-black" />
                </div>
                <div className="flex flex-col items-start translate-y-[1px]">
                  <span className="text-xs font-black tracking-widest text-orange-500 uppercase">{t('viewOrder')}</span>
                  <span className="text-lg font-bold leading-none">{cartTotal} <span className="text-xs font-normal opacity-60 ml-1">{t('currency')}</span></span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-4 opacity-40 py-3">
                <ShoppingBag size={20} />
                <span className="text-sm font-bold tracking-wide uppercase">{t('cartEmpty')}</span>
              </div>
            )}
          </div>
          {cartItemCount > 0 && (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </footer>

      {/* Modals - Keeping core logic intact */}
      <ProductDrawer isOpen={isDrawerOpen} item={selectedProduct} onClose={() => setIsDrawerOpen(false)} onAddToCart={handleAddToCart} />
      <CheckoutDrawer isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} onClearCart={() => setCart([])} />
    </div>
  );
}

function MenuCard({ item, lang, t, onClick, mode }) {
  if (mode === 'grid') {
    return (
      <article onClick={onClick} className="group cursor-pointer">
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-[#121212] border border-white/5 transition-all group-hover:border-orange-500/30">
          <img
            src={item.image}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="bg-orange-500 text-black px-3 py-1 rounded-lg text-sm font-black italic">
              {item.price}
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>
        <h3 className="text-sm font-bold tracking-wide px-1 line-clamp-1 group-hover:text-orange-500 transition-colors">{item.name[lang]}</h3>
        <p className="text-[10px] text-gray-500 mt-1 px-1 line-clamp-1 opacity-60 uppercase tracking-widest leading-tight">{item.description[lang]}</p>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      className="glass-card p-4 rounded-2xl flex gap-4 group cursor-pointer border-white/5 hover:border-orange-500/20 transition-all"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#121212] border border-white/5 shrink-0">
        <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold tracking-wide truncate">{item.name[lang]}</h3>
          <span className="text-sm font-black text-orange-500">{item.price} <span className="text-[10px] font-normal opacity-50 uppercase">{t('currency')}</span></span>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1 opacity-70 italic">"{item.description[lang]}"</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">دمشقي</div>
          <div className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">طازج</div>
        </div>
      </div>
    </article>
  );
}
