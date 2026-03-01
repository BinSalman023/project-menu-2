import React, { useState, useMemo } from 'react';

export default function ProductDrawer({ item, lang, t, onClose, onAdd }) {
    const [selections, setSelections] = useState({});
    const [notes, setNotes] = useState('');

    const groups = item.optionGroups || [];

    const requiredGroups = groups.filter(g => g.id !== 'adds');
    const allRequiredSelected = requiredGroups.every(g => selections[g.id]);

    const totalPrice = useMemo(() => {
        let total = item.price;
        Object.values(selections).forEach(opt => {
            if (opt?.price) total += opt.price;
        });
        return total;
    }, [selections, item.price]);

    const handleSelect = (groupId, option) => {
        setSelections(prev => ({ ...prev, [groupId]: option }));
    };

    const handleAdd = () => {
        if (!allRequiredSelected && requiredGroups.length > 0) {
            alert(t('selectItemsReq'));
            return;
        }
        onAdd(item, selections, notes);
    };

    return (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bottom-sheet">
                <div className="sheet-handle"><div className="handle-bar" /></div>
                <button className="sheet-close" onClick={onClose}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>

                {item.image && (
                    <img
                        src={item.image}
                        alt={item.name?.[lang] || item.name?.ar}
                        className="product-sheet-img"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}

                <div className="product-sheet-body">
                    <div>
                        <h2 className="product-sheet-title">{item.name?.[lang] || item.name?.ar}</h2>
                        {item.description && (
                            <p className="product-sheet-desc" style={{ marginTop: 6 }}>
                                {item.description?.[lang] || item.description?.ar}
                            </p>
                        )}
                    </div>

                    <p className="product-sheet-price">
                        {totalPrice}
                        <span className="currency">₺</span>
                    </p>

                    {groups.map(group => {
                        const isRequired = group.id !== 'adds';
                        return (
                            <div key={group.id} className="option-group">
                                <div className="option-group-header">
                                    <p className="option-group-title">{group.name?.[lang] || group.name?.ar}</p>
                                    <p className="option-group-subtitle">
                                        {isRequired ? t('requiredOptions') : t('optionalAdds')}
                                    </p>
                                </div>
                                {group.options.map(option => {
                                    const isSelected = selections[group.id]?.id === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            className={`option-item${isSelected ? ' selected' : ''}`}
                                            onClick={() => handleSelect(group.id, option)}
                                        >
                                            <div className="option-label">
                                                <div className="option-radio">
                                                    {isSelected && <div className="option-radio-dot" />}
                                                </div>
                                                <span className="option-name">{option.name?.[lang] || option.name?.ar}</span>
                                            </div>
                                            {option.price > 0 && (
                                                <span className="option-extra">+{option.price} ₺</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Notes */}
                    <div className="notes-section">
                        <p className="notes-label">{t('notes')}</p>
                        <textarea
                            className="notes-input"
                            placeholder={t('notesPlaceholder')}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Add to Cart */}
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAdd}
                        disabled={!allRequiredSelected && requiredGroups.length > 0}
                    >
                        <span>{t('addToCart')}</span>
                        <span className="btn-price-badge">{totalPrice} ₺</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
