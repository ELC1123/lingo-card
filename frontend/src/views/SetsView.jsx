import { useMemo } from 'react';
import { SET_METADATA } from '../data/setMetadata';

// Memoized function to get unique sets from the collection with progress info
const SetsView = ({ collection, onSelectSet }) => {
    const setGroups = useMemo(() => {
        const allSetCodes = Object.keys(SET_METADATA).filter(code => code !== 'default');

        return allSetCodes.map(code => {
            const meta = SET_METADATA[code];
            const cardsInSet = collection.filter(card => card.setCode === code);
            const uniqueCards = new Set(cardsInSet.map(card => card.name));

            return {
                code: code,
                uniqueCards: uniqueCards,
                coverImage: meta.logo,
                totalSetSize: meta.total,
                isLogo: true,
                progress: uniqueCards.size
            };
        });
    }, [collection]);

    return (
        <div>
            <h2 style={{color: 'white', marginBottom: '10px'}}>Select a Set</h2>
            <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                {setGroups.map((set) => (
                    <div key = {set.code}
                        onClick={() => onSelectSet(set.code)}
                        style={{
                            border: '1px solid #ddd', borderRadius: '12px', padding: '15px',
                            width: '160px', cursor: 'pointer', background: '#2a2a2a',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
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