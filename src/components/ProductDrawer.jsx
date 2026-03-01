import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function ProductDrawer({ isOpen, item, onClose, onAddToCart }) {
    const { lang, t } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState({});
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setQuantity(1);
            setNotes('');

            const defaultSelections = {};
            if (item.optionGroups) {
                item.optionGroups.forEach(group => {
                    if (group.options && group.options.length > 0) {
                        defaultSelections[group.id] = group.options[0].id;
                    }
                });
            }
            setSelections(defaultSelections);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    let unitPrice = item.price;
    if (item.optionGroups) {
        item.optionGroups.forEach(group => {
            const selectedOptionId = selections[group.id];
            const selectedOption = group.options.find(opt => opt.id === selectedOptionId);
            if (selectedOption && selectedOption.price) {
                unitPrice += selectedOption.price;
            }
        });
    }

    const totalPrice = unitPrice * quantity;

    const handleAddToCart = () => {
        const formattedSelections = [];
        if (item.optionGroups) {
            item.optionGroups.forEach(group => {
                const selectedOptionId = selections[group.id];
                const selectedOption = group.options.find(opt => opt.id === selectedOptionId);
                if (selectedOption) {
                    formattedSelections.push({
                        groupName: group.name,
                        optionName: selectedOption.name,
                        price: selectedOption.price
                    });
                }
            });
        }

        onAddToCart({
            ...item,
            quantity,
            totalPrice,
            selections: formattedSelections,
            notes
        });
        onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
                onClick={onClose}
            />

            <div className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#0a0a0a] text-white rounded-t-[2.5rem] z-50 flex flex-col overflow-hidden animate-slide-up border-t border-white/10 max-w-2xl mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                {/* Header Image */}
                <div className="relative h-72 shrink-0 bg-[#121212]">
                    <img
                        src={item.image}
                        alt={item.name[lang]}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 h-12 w-12 glass-card rounded-full flex items-center justify-center text-white border-white/10 hover:bg-white/10 transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="absolute bottom-6 left-8 right-8">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">{item.name[lang]}</h2>
                                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase opacity-60">
                                    {lang === 'ar' ? 'مذاق دمشقي أصيل' : 'AUTHENTIC TASTE'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-10">
                    {/* Description */}
                    <div className="pt-2">
                        <p className="text-gray-400 text-sm leading-relaxed font-medium italic">
                            "{item.description[lang]}"
                        </p>
                    </div>

                    {/* Dynamic Option Groups */}
                    {item.optionGroups && item.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] flex-1 bg-white/5"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
                                    {group.name[lang]}
                                </h4>
                                <div className="h-[1px] flex-1 bg-white/5"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {group.options.map(option => (
                                    <label
                                        key={option.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selections[group.id] === option.id
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-white/5 bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selections[group.id] === option.id ? 'border-orange-500' : 'border-gray-600'
                                                }`}>
                                                {selections[group.id] === option.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                                            </div>
                                            <span className={`text-sm font-bold ${selections[group.id] === option.id ? 'text-white' : 'text-gray-400'}`}>
                                                {option.name[lang]}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-black italic ${selections[group.id] === option.id ? 'text-orange-500' : 'text-gray-500'}`}>
                                            {option.price > 0 ? `+${option.price} ${t('currency')}` : ''}
                                        </span>
                                        <input
                                            type="radio"
                                            name={`group-${group.id}`}
                                            className="hidden"
                                            checked={selections[group.id] === option.id}
                                            onChange={() => setSelections(prev => ({ ...prev, [group.id]: option.id }))}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Notes Field */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                            <label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                                {t('notes')}
                            </label>
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('notesPlaceholder')}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:border-orange-500/50 outline-none resize-none placeholder:text-gray-700"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer fixed */}
                <div className="p-6 glass-card border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">الكمية / QUANTITY</span>
                        <div className="flex items-center gap-6 glass-card rounded-2xl px-3 py-2 border-white/5">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                                disabled={quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="w-4 text-center text-lg font-black italic">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full h-16 bg-orange-500 text-black rounded-2xl font-black italic flex items-center justify-between px-8 hover:bg-orange-400 active:scale-[0.98] transition-all shadow-2xl shadow-orange-500/20"
                    >
                        <span className="uppercase tracking-tighter text-lg">{t('addToCart')}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{totalPrice}</span>
                            <span className="text-xs font-bold uppercase">{t('currency')}</span>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
