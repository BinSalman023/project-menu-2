import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from './LanguageContext';
import { MENU_CATEGORIES, MENU_ITEMS } from './data';
import ProductDrawer from './components/ProductDrawer';
import CheckoutDrawer from './components/CheckoutDrawer';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RESTAURANT_COORDS = [41.00134562745214, 28.8420208];

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcDeliveryFee(distKm) {
  const raw = distKm * 20;
  return Math.ceil(raw / 5) * 5;
}

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

// ─── Map Click Handler ─────────────────────────────────────
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click: (e) => onLocationSelect(e.latlng) });
  return null;
}

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const langRef = useRef(null);
  const sectionRefs = useRef({});

  // close lang menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll spy for category highlight
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + 150;
    for (const catId of Object.keys(sectionRefs.current)) {
      const el = sectionRefs.current[catId];
      if (el && el.offsetTop <= scrollY) setActiveCategory(catId);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToCategory = (catId) => {
    const el = sectionRefs.current[catId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Cart Logic
  const addToCart = (item, options, notes) => {
    const id = `${item.id}-${Date.now()}`;
    setCart(prev => [...prev, { id, item, options, notes, qty: 1 }]);
    setSelectedItem(null);
  };

  const changeQty = (cartId, delta) => {
    setCart(prev => prev
      .map(c => c.id === cartId ? { ...c, qty: c.qty + delta } : c)
      .filter(c => c.qty > 0)
    );
  };

  const cartItemCount = cart.reduce((a, c) => a + c.qty, 0);

  const getItemTotal = (c) => {
    const base = c.item.price;
    const opts = Object.values(c.options || {}).reduce((sum, o) => sum + (o?.price || 0), 0);
    return (base + opts) * c.qty;
  };

  const subtotal = cart.reduce((sum, c) => sum + getItemTotal(c), 0);
  const total = subtotal + deliveryFee;

  // Delivery
  const handleLocationSelect = (latlng) => {
    const dist = calcDistance(RESTAURANT_COORDS[0], RESTAURANT_COORDS[1], latlng.lat, latlng.lng);
    setDeliveryLocation(latlng);
    setDeliveryFee(calcDeliveryFee(dist));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handleLocationSelect(latlng);
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  // Filter items by search
  const filterItems = (items) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => {
      const n = item.name?.[lang] || item.name?.ar || '';
      return n.toLowerCase().includes(q);
    });
  };

  // WhatsApp Order
  const sendWhatsApp = () => {
    const lines = [];
    lines.push(`🏰 *مطعم قلعة الشام*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🛒 *الطلب:*`);
    cart.forEach(c => {
      lines.push(`• ${c.item.name?.ar} × ${c.qty} — ${getItemTotal(c)} ₺`);
      const mods = Object.values(c.options || {}).filter(o => o).map(o => o.name?.ar).join(', ');
      if (mods) lines.push(`  ↳ ${mods}`);
      if (c.notes) lines.push(`  📝 ${c.notes}`);
    });
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💰 *المجموع الفرعي:* ${subtotal} ₺`);
    lines.push(`🚗 *رسوم التوصيل:* ${deliveryFee} ₺`);
    lines.push(`🔢 *الإجمالي:* ${total} ₺`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👤 *بيانات العميل:*`);
    if (customerName) lines.push(`الاسم: ${customerName}`);
    if (buildingNo) lines.push(`رقم البناية: ${buildingNo}`);
    if (flatNo) lines.push(`رقم الشقة: ${flatNo}`);
    if (deliveryLocation) lines.push(`📍 الموقع: https://maps.google.com/?q=${deliveryLocation.lat},${deliveryLocation.lng}`);
    const msg = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Filtered categories
  const searchActive = search.trim().length > 0;

  return (
    <div className="app-shell">

      {/* ── Top Bar ── */}
      <header className="top-bar">
        <div className="top-bar-inner">
          <div className="brand-block">
            <img
              src="/images/logo-Qalaat-Al-Sham.png"
              alt="قلعة الشام"
              className="brand-logo"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span className="brand-name">قلعة الشام</span>
          </div>

          <div className="search-wrap">
            <span className="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="search-input"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }} ref={langRef}>
            <button className="lang-toggle-btn" onClick={() => setLangMenuOpen(p => !p)}>
              {lang.toUpperCase()}
            </button>
            {langMenuOpen && (
              <div className="lang-menu">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    className={`lang-menu-item${lang === l.code ? ' active' : ''}`}
                    onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                  >
                    <span className="flag">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      {!searchActive && (
        <div className="hero">
          <img
            src="/images/arabic-shawarma-meal.png"
            alt="قلعة الشام"
            className="hero-img"
          />
          <div className="hero-gradient" />
          <div className="hero-content">
            <div className="hero-info">
              <h1 className="hero-title">مطعم قلعة الشام</h1>
              <p className="hero-subtitle">شاورما · غربي · شرقي · مشاوي</p>
            </div>
            <span className="hero-badge">🕐 30–45 دقيقة</span>
          </div>
        </div>
      )}

      {/* ── Category Pills ── */}
      {!searchActive && (
        <div className="cat-strip-wrap">
          <div className="cat-strip">
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-pill${activeCategory === cat.id ? ' active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {cat.label[lang] || cat.label.ar}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Menu Content ── */}
      <main className="menu-content">
        {MENU_CATEGORIES.map(cat => {
          const items = filterItems(MENU_ITEMS.filter(i => i.categoryId === cat.id));
          if (items.length === 0) return null;
          return (
            <section
              key={cat.id}
              className="category-section"
              ref={el => { sectionRefs.current[cat.id] = el; }}
            >
              <div className="section-header">
                <h2 className="section-title">{cat.label[lang] || cat.label.ar}</h2>
                <span className="section-count">{items.length}</span>
                <div className="section-divider" />
              </div>

              <div className="items-grid">
                {items.map(item => (
                  <article
                    key={item.id}
                    className="menu-card"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="card-img-wrap">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name?.[lang] || item.name?.ar}
                          className="card-img"
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="card-img-placeholder" style={{ display: item.image ? 'none' : 'flex' }}>🍽️</div>
                    </div>
                    <div className="card-body">
                      <p className="card-name">{item.name?.[lang] || item.name?.ar}</p>
                      {item.description && (
                        <p className="card-desc">{item.description?.[lang] || item.description?.ar}</p>
                      )}
                      <div className="card-footer">
                        <span className="card-price">
                          {item.price}
                          <span>₺</span>
                        </span>
                        <span className="add-btn" aria-label="إضافة">＋</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {searchActive && MENU_CATEGORIES.every(cat =>
          filterItems(MENU_ITEMS.filter(i => i.categoryId === cat.id)).length === 0
        ) && (
            <p className="no-items-found">لا توجد نتائج لـ "{search}"</p>
          )}
      </main>

      {/* ── Floating Cart FAB ── */}
      {cartItemCount > 0 && (
        <div className="cart-fab">
          <button className="cart-fab-inner" onClick={() => setCartOpen(true)}>
            <div className="fab-left">
              <span className="fab-badge">{cartItemCount}</span>
              <span className="fab-label">{t('viewOrder')}</span>
            </div>
            <span className="fab-total">{subtotal} ₺</span>
          </button>
        </div>
      )}

      {/* ── Product Drawer ── */}
      {selectedItem && (
        <ProductDrawer
          item={selectedItem}
          lang={lang}
          t={t}
          onClose={() => setSelectedItem(null)}
          onAdd={addToCart}
        />
      )}

      {/* ── Cart / Checkout Drawer ── */}
      {cartOpen && (
        <CheckoutDrawer
          cart={cart}
          lang={lang}
          t={t}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          getItemTotal={getItemTotal}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          deliveryLocation={deliveryLocation}
          onLocationSelect={handleLocationSelect}
          onDetectLocation={detectLocation}
          geoLoading={geoLoading}
          customerName={customerName}
          setCustomerName={setCustomerName}
          buildingNo={buildingNo}
          setBuildingNo={setBuildingNo}
          flatNo={flatNo}
          setFlatNo={setFlatNo}
          onConfirm={sendWhatsApp}
          RESTAURANT_COORDS={RESTAURANT_COORDS}
          MapClickHandler={MapClickHandler}
        />
      )}
    </div>
  );
}
