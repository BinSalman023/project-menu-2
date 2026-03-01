import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapClickHandler({ onLocationSelect }) {
    useMapEvents({ click: (e) => onLocationSelect(e.latlng) });
    return null;
}

export default function CheckoutDrawer({
    cart, lang, t, onClose, onChangeQty, getItemTotal,
    subtotal, deliveryFee, total,
    deliveryLocation, onLocationSelect, onDetectLocation, geoLoading,
    customerName, setCustomerName,
    buildingNo, setBuildingNo,
    flatNo, setFlatNo,
    onConfirm,
    RESTAURANT_COORDS,
}) {
    const canConfirm = cart.length > 0 && deliveryLocation;

    return (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bottom-sheet">
                <div className="sheet-handle"><div className="handle-bar" /></div>
                <button className="sheet-close" onClick={onClose}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="cart-sheet-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="cart-sheet-title">{t('yourOrder')}</span>
                        <span className="cart-title-badge">{cart.reduce((a, c) => a + c.qty, 0)}</span>
                    </div>
                </div>

                <div className="cart-body">
                    {/* Items */}
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <p className="cart-empty-text">{t('cartEmpty')}</p>
                        </div>
                    ) : (
                        cart.map(c => (
                            <div key={c.id} className="cart-item-row">
                                <img
                                    src={c.item.image}
                                    alt={c.item.name?.[lang] || c.item.name?.ar}
                                    className="cart-item-img"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div className="cart-item-info">
                                    <p className="cart-item-name">{c.item.name?.[lang] || c.item.name?.ar}</p>
                                    <p className="cart-item-mods">
                                        {Object.values(c.options || {}).filter(Boolean).map(o => o.name?.[lang] || o.name?.ar).join(' · ')}
                                        {c.notes && ` · 📝 ${c.notes}`}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                    <span className="cart-item-price">{getItemTotal(c)} ₺</span>
                                    <div className="cart-item-qty">
                                        <button className="qty-btn remove" onClick={() => onChangeQty(c.id, -1)}>−</button>
                                        <span className="qty-count">{c.qty}</span>
                                        <button className="qty-btn" onClick={() => onChangeQty(c.id, 1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Delivery Location */}
                    {cart.length > 0 && (
                        <>
                            <p className="section-label">
                                📍 {t('detectLocation')}
                            </p>

                            <div className="map-container">
                                <MapContainer
                                    center={deliveryLocation ? [deliveryLocation.lat, deliveryLocation.lng] : RESTAURANT_COORDS}
                                    zoom={13}
                                    style={{ width: '100%', height: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="© OpenStreetMap"
                                    />
                                    <MapClickHandler onLocationSelect={onLocationSelect} />
                                    {deliveryLocation && (
                                        <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} />
                                    )}
                                </MapContainer>
                            </div>

                            {deliveryLocation ? (
                                <div className="location-confirmed">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
                                    </svg>
                                    {t('locationDetected')} — {t('deliveryFee')}: {deliveryFee} ₺
                                    <button
                                        style={{ marginInlineStart: 'auto', fontSize: 11, color: 'var(--gold)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                        onClick={() => { onDetectLocation?.(); }}
                                    >
                                        {t('updateLocation')}
                                    </button>
                                </div>
                            ) : (
                                <button className="detect-btn" onClick={onDetectLocation} disabled={geoLoading}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                                    </svg>
                                    {geoLoading ? t('detectingLocation') : t('detectLocation')}
                                </button>
                            )}

                            {/* Customer Info */}
                            <p className="section-label">
                                👤 {lang === 'ar' ? 'بيانات التوصيل' : lang === 'tr' ? 'Teslimat Bilgileri' : 'Delivery Details'}
                            </p>

                            <div className="input-group">
                                <input
                                    className="text-input"
                                    placeholder={t('optionalName')}
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                                <input
                                    className="text-input"
                                    placeholder={t('optionalBuilding')}
                                    value={buildingNo}
                                    onChange={e => setBuildingNo(e.target.value)}
                                />
                                <input
                                    className="text-input"
                                    placeholder={t('optionalFlat')}
                                    value={flatNo}
                                    onChange={e => setFlatNo(e.target.value)}
                                />
                            </div>

                            {/* Summary */}
                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span className="label">{t('subtotal')}</span>
                                    <span className="value">{subtotal} ₺</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">{t('deliveryFee')}</span>
                                    <span className="value">{deliveryFee > 0 ? `${deliveryFee} ₺` : '—'}</span>
                                </div>
                                <div className="summary-row total">
                                    <span className="label">{t('total')}</span>
                                    <span className="value">{total} ₺</span>
                                </div>
                            </div>

                            {/* Confirm */}
                            <button
                                className="confirm-btn"
                                onClick={onConfirm}
                                disabled={!canConfirm}
                            >
                                <svg className="whatsapp-green" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                {t('confirmOrder')} — {total} ₺
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
