import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Crosshair, ChevronRight, ShoppingBag, CreditCard } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RESTAURANT_LOC = {
    lat: 41.00134562745214,
    lng: 28.8420208
};
const RESTAURANT_PHONE = '+905526599976';
const FEE_PER_KM = 20;

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function CheckoutDrawer({ isOpen, onClose, cart, onClearCart }) {
    const { lang, t } = useLanguage();
    const [name, setName] = useState('');
    const [building, setBuilding] = useState('');
    const [flat, setFlat] = useState('');
    const [userLoc, setUserLoc] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLocationError('');
        }
    }, [isOpen]);

    const handleLocateUser = () => {
        setIsLocating(true);
        setLocationError('');
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLocating(false);
                },
                (error) => {
                    setIsLocating(false);
                    setLocationError(t('locationError'));
                },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
            setLocationError(t('locationError'));
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setUserLoc(e.latlng);
            },
        });
        return userLoc === null ? null : (
            <Marker position={userLoc}></Marker>
        );
    };

    const calculateRoundedFee = (distanceKm) => {
        const exactFee = distanceKm * FEE_PER_KM;
        if (exactFee % 5 === 0) return exactFee;
        return Math.ceil(exactFee / 5) * 5;
    };

    const deliveryFee = userLoc ? calculateRoundedFee(getDistanceFromLatLonInKm(RESTAURANT_LOC.lat, RESTAURANT_LOC.lng, userLoc.lat, userLoc.lng)) : 0;
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal + deliveryFee;

    const generateWhatsAppMessage = () => {
        let text = `🛍️ *طلب جديد من مطعم قلعة الشام* 🛍️\n`;
        text += `\n───────────────`;
        text += `\n👤 *بيانات العميل والتوصيل:*`;
        if (name) text += `\n*الاسم:* ${name}`;
        if (building || flat) {
            text += `\n*العنوان:* مبنى ${building || '-'}، شقة ${flat || '-'}`;
        }
        if (userLoc) {
            text += `\n*الموقع على الخريطة:* https://www.google.com/maps/search/?api=1&query=${userLoc.lat},${userLoc.lng}`;
        }
        text += `\n───────────────`;
        text += `\n📝 *تفاصيل الطلب:*`;
        cart.forEach((item, index) => {
            text += `\n\n${index + 1}. ${item.quantity}x ${item.name['ar']} - ${item.totalPrice} TRY`;
            if (item.selections && item.selections.length > 0) {
                text += `\n   الإضافات: ${item.selections.map(s => s.optionName['ar']).join(', ')}`;
            }
            if (item.notes) {
                text += `\n   ملاحظات: ${item.notes}`;
            }
        });
        text += `\n───────────────`;
        text += `\n💰 *تفاصيل الحساب:*`;
        text += `\n*المجموع الفرعي:* ${subtotal} TRY`;
        text += `\n*رسوم التوصيل:* ${deliveryFee} TRY`;
        text += `\n*الإجمالي المطلوب:* ${total} TRY`;
        text += `\n───────────────`;
        return encodeURIComponent(text);
    };

    const handleConfirmOrder = () => {
        if (!userLoc) {
            alert(t('locationError'));
            return;
        }
        const message = generateWhatsAppMessage();
        window.open(`https://wa.me/${RESTAURANT_PHONE.replace('+', '')}?text=${message}`, '_blank');
        onClearCart();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity"
                onClick={onClose}
            />

            <div className={`fixed bottom-0 left-0 right-0 h-[95vh] bg-[#050505] text-white rounded-t-[2.5rem] z-[60] flex flex-col overflow-hidden animate-slide-up border-t border-white/10 max-w-2xl mx-auto ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-7 glass-card border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={24} className="text-orange-500" />
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">{t('yourOrder')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 glass-card rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
                    {cart.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag size={32} className="text-gray-600" />
                            </div>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('cartEmpty')}</p>
                        </div>
                    ) : (
                        <>
                            {/* Items */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Items ({cart.length})</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>
                                {cart.map((item, index) => (
                                    <div key={index} className="glass-card p-4 rounded-2xl border-white/5 flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500 text-black flex items-center justify-center font-black italic text-lg shrink-0">
                                            {item.quantity}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-sm truncate uppercase tracking-wide">{item.name[lang]}</h4>
                                                <span className="font-black text-sm text-orange-500 whitespace-nowrap">{item.totalPrice} <span className="text-[10px] font-normal opacity-50 uppercase">{t('currency')}</span></span>
                                            </div>
                                            {item.selections && item.selections.length > 0 && (
                                                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">
                                                    {item.selections.map(s => s.optionName[lang]).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Location */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">{t('detectLocation')}</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>
                                <div className="glass-card p-6 rounded-3xl border-white/5 space-y-6">
                                    {!userLoc ? (
                                        <button
                                            onClick={handleLocateUser}
                                            disabled={isLocating}
                                            className="w-full h-14 glass-card border-orange-500/20 text-orange-500 rounded-2xl font-black italic flex items-center justify-center gap-3 hover:bg-orange-500/10 transition-all disabled:opacity-30"
                                        >
                                            <Crosshair size={20} className={isLocating ? 'animate-spin' : ''} />
                                            <span className="uppercase tracking-tight">{isLocating ? t('detectingLocation') : t('detectLocation')}</span>
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/5 z-0 grayscale invert brightness-90 contrast-90">
                                                <MapContainer center={userLoc} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                    <LocationMarker />
                                                </MapContainer>
                                            </div>
                                            <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest">{lang === 'ar' ? 'انقر على الخريطة لتعديل موقعك بدقة' : 'CLICK ON MAP TO REFINE LOCATION'}</p>
                                        </div>
                                    )}
                                    {locationError && <p className="text-xs text-red-500 text-center font-bold">{locationError}</p>}
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Details</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder={t('optionalName')}
                                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold placeholder:text-gray-700 outline-none focus:border-orange-500/30 transition-all"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder={t('optionalBuilding')}
                                            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold placeholder:text-gray-700 outline-none focus:border-orange-500/30 transition-all"
                                            value={building}
                                            onChange={(e) => setBuilding(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder={t('optionalFlat')}
                                            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold placeholder:text-gray-700 outline-none focus:border-orange-500/30 transition-all"
                                            value={flat}
                                            onChange={(e) => setFlat(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-8 glass-card border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>{t('subtotal')}</span>
                                <span className="text-white">{subtotal} {t('currency')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>{t('deliveryFee')}</span>
                                {userLoc ? (
                                    <span className="text-white">{deliveryFee} {t('currency')}</span>
                                ) : (
                                    <span className="text-orange-500 italic">{lang === 'ar' ? 'حدد الموقع' : 'SELECT LINK'}</span>
                                )}
                            </div>
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-widest">{t('total')}</span>
                                <span className="text-3xl font-black italic tracking-tighter text-orange-500">{total} <span className="text-xs font-bold not-italic text-white opacity-40 ml-1">{t('currency')}</span></span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={!userLoc}
                            className={`w-full h-16 rounded-2xl font-black italic flex items-center justify-between px-8 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-orange-500/20
                                ${userLoc
                                    ? 'bg-orange-500 text-black'
                                    : 'bg-white/5 text-gray-600'}`}
                        >
                            <span className="uppercase tracking-tighter text-lg">{t('confirmOrder')}</span>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
