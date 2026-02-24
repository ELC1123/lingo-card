import { useMemo } from 'react';
import Card from '../components/Card';
import { getCardNumber } from '../utils/cardHelper';

/**
 * Shows cards for a selected set in the user's collection.
 * Groups identical cards and sorts by the numeric card number where possible.
 */
const BinderView = ({ collection, selectedSet, onBack }) => {
    const binderCards = useMemo(() => {
        if (!selectedSet) {
            return [];
        }

        const setCards = collection.filter(card => card.setCode === selectedSet);

        const grouped = setCards.reduce((acc, card) => {
            const key = `${card.name}-${card.rarity}-${card.imageUrl}`;
            if (!acc[key]) {
                acc[key] = { ...card, count: 1 };
            } else {
                acc[key].count += 1;
            }
            return acc;
        }, {});

        // Convert grouped map to array and sort by the card's numeric id (if parsable)
        return Object.values(grouped).sort((a, b) => {
            const numA = getCardNumber(a.imageUrl);
            const numB = getCardNumber(b.imageUrl);
            return (typeof numA === 'number' ? numA : 999) - (typeof numB === 'number' ? numB : 999);
        });
    }, [collection, selectedSet]);

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', gap: '10px', marginBottom: '20px', paddingTop: '20px'}}>
                <button onClick={onBack} style={{...buttonStyle('#888'), padding: '5px 15px', fontSize: '12px'}}>
                    ← Back to Sets
                </button>
                <h2 style={{color: 'white', margin: 0}}>{selectedSet ? selectedSet.toUpperCase() : ''} Collection</h2>
            </div>

            {binderCards.length === 0 ? (
                <div style={{color: '#aaa', fontSize: '16px'}}>No cards from this set in your collection yet.</div>
            ) : (
                <div style={{justifyContent: 'center', flexWrap: 'wrap', display: 'flex', gap: '20px'}}>
                    {binderCards.map((card) => (
                        <Card 
                            key={`${card.name}-${card.rarity}-${card.imageUrl}`} 
                            card={card} 
                            width="150px" 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const buttonStyle = (color) => ({
    padding: '12px 24px', 
    fontSize: '18px', 
    cursor: 'pointer', 
    backgroundColor: color, 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
});


export default BinderView;