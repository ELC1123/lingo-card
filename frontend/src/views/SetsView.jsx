import { useMemo } from 'react';
import { SET_METADATA } from '../data/setMetadata';

/**
 * Displays available sets and the user's progress collecting unique cards from those sets.
 * Uses `SET_METADATA` to know expected total counts per set. This view is memoized
 * so recomputation only occurs when `collection` changes.
 */
const SetsView = ({ collection, onSelectSet }) => {
    const setGroups = useMemo(() => {
        const allSetCodes = Object.keys(SET_METADATA).filter(code => code !== 'default');

        return allSetCodes.map(code => {
            const meta = SET_METADATA[code];
            // Filter cards in the collection that belong to this set
            const cardsInSet = collection.filter(card => card.setCode === code);
            // Create a set of unique card image URLs to determine progress
            const uniqueCards = new Set(cardsInSet.map(card => card.imageUrl));
            // Determine if the set is completed based on unique cards collected vs total cards in the set
            const isCompleted = uniqueCards.size >= meta.total;

            return {
                code: code,
                uniqueCards: uniqueCards,
                coverImage: meta.logo,
                totalSetSize: meta.total,
                isLogo: true,
                progress: uniqueCards.size,
                isCompleted: isCompleted
            };
        });
    }, [collection]);

    return (
        <div>
            <h2 style={{color: 'white', marginBottom: '10px'}}>Select a Set</h2>
            <div style={{justifyContent: 'flex-start', flexWrap: 'wrap', display: 'flex', gap: '20px'}}>
                {setGroups.map((set) => (
                    <div key = {set.code}
                        onClick={() => onSelectSet(set.code)}
                        style={{
                            border: set.isCompleted ? '3px solid #FFD700' : '1px solid #ddd',
                            boxShadow: set.isCompleted ? '0 0 20px rgba(255, 215, 0, 0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                            borderRadius: '12px', padding: '15px',
                            width: '160px', cursor: 'pointer', background: '#2a2a2a',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {set.isCompleted && (
                            <div style={{
                                position: 'absolute',
                                top: '12px', right: '-30px',
                                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                color: '#000',
                                width: '100px',
                                textAlign: 'center',
                                fontSize: '10px',
                                fontWeight: '900',
                                padding: '4px 0',
                                transform: 'rotate(45deg)', // Diagonal ribbon
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                zIndex: 10,
                                letterSpacing: '1px'
                            }}>
                                COMPLETED
                            </div>
                        )}
                        <div style={{height: '100px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'}}>
                            <img src={set.coverImage} alt={set.code} style={{
                                maxWidth: '100%', maxHeight: '100%', borderRadius: set.isLogo ? '0' : '6px', 
                                objectFit: 'contain', filter: set.isLogo ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                            }} />
                        </div>
                        <h3 style={{margin: '10px 0 5px 0', fontSize:'18px'}}>{set.code}</h3>
                        <div style={{color: '#aaa', fontSize: '14px', fontWeight: 'bold'}}>
                            Progress: <span style={{color: '#4caf50'}}>{set.progress}</span> / {set.totalSetSize}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SetsView;