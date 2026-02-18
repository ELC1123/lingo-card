import { useState, useEffect, useCallback, useMemo } from "react";
import './App.css';
import Card from './components/Card';
import { getCardNumber } from './utils/cardHelper'; // You still need this for sorting!

const SET_METADATA = {
        'me01':  { logo: 'https://assets.tcgdex.net/en/me/me01/logo.png', total: 188 },          // mega evolution set
        'swsh1': { logo: 'https://assets.tcgdex.net/en/swsh/swsh1/logo.png', total: 202 },
        'sv1':   { logo: 'https://assets.tcgdex.net/en/sv/sv1/logo.png', total: 198 },
        'default': { logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg', total: 100 }
    }

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [view, setView] = useState('pack'); // 'pack' or 'binder'
    const [selectedSet, setSelectedSet] = useState(false); // State to track the selected set for filtering
    const [loading, setLoading] = useState(false); // State to track loading status

    // State to track owned cards for "NEW!" badge logic
    const ownedCards = useMemo(() => {
        return new Set(collection.map(c => {
            return `${c.name}-${c.rarity}-${c.imageUrl}`; // Unique identifier for each card variant
        }));
    }, [collection]);

    // Function to refresh collection data from the backend
    const refreshCollection = useCallback(() => {
        setLoading(true);
        fetch('http://localhost:8080/api/collection')
            .then((res) => res.json())
            .then((data) => {
                setCollection(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching collection:", error);
                setLoading(false);
            });
    }, []);

    // Fetch collection on initial load
    useEffect(() => {
        refreshCollection();
    }, [refreshCollection]);

    // Memoized function to extract unique sets from the collection
    const handleOpenPack = useCallback(() => {
        setLoading(true);
        fetch('http://localhost:8080/api/collection')
            .then((res) => res.json())
            .then(currentCollection => {
                setCollection(currentCollection);
                return fetch('http://localhost:8080/api/packs/open-pack', {method: 'POST'});
            })
            .then((response) => response.json())
            .then((data) => {
                setPack(data);
                setView('pack');
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error opening pack:", error);
                setLoading(false);
            });
    }, []);

    // Memoized function to extract unique sets from the collection
    const handleViewSets = useCallback(() => {
        refreshCollection();
        setView('sets');
    }, [refreshCollection]);

    // Memoized function to get unique sets from the collection
    const handleViewSetBinder = useCallback((setCode) => {
        setSelectedSet(setCode);
        setView('binder');
    }, []);

    // Memoized function to get unique sets from the collection with progress info
    const setGroups = useMemo(() => {
        const sets = {};
        
        if(!Array.isArray(collection)) {
            return [];
        }

        collection.forEach(card => {
            const code = card.setCode;
            const meta = SET_METADATA[code.toLowerCase()] || SET_METADATA['default'];

            if(!sets[code]) {
                sets[code] = {
                    code: code,
                    uniqueCards: new Set(),
                    coverImage: meta.logo,
                    totalSetSize: meta.total,
                    isLogo: !!SET_METADATA[code.toLowerCase()]
                };
            }
            sets[code].uniqueCards.add(card.name);
        });

        return Object.values(sets).map(set => ({
            ...set,
            progress: set.uniqueCards.size
        }));
    }, [collection]);

    // Memoized function to get cards for the binder view, grouped and sorted
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

        return Object.values(grouped).sort((a, b) => {
            const numA = getCardNumber(a.imageUrl);
            const numB = getCardNumber(b.imageUrl);
            return typeof numA === 'number' ? numA - numB : 0;
        });
    }, [collection, selectedSet]);

    return (
        <div style = {{
            padding: '5px',
            textAlign: 'center'
        }}>
            <h1>Lingo Card Alpha</h1>

            <div style = {{
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
            }}>
                <button onClick={handleOpenPack} style={buttonStyle('#ff5e5e')} disabled={loading}>
                    {loading ? 'Opening...' : 'Open Pack'}
                </button>
                <button onClick={handleViewSets} style={buttonStyle('#5e9cff')} disabled={loading}>
                    My Collection
                </button>
            </div>

            {view === 'sets' && (
                <div>
                    <h2 style={{color: 'white', marginBottom: '10px'}}>Select a Set</h2>
                    <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        {setGroups.map((set) => (
                            <div key = {set.code}
                                onClick={() => handleViewSetBinder(set.code)}
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
            )}

            {view === 'binder' && (
                <div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                        <button onClick={handleViewSets} style={{...buttonStyle('#888'), padding: '5px 15px', fontSize: '12px'}}>
                            ← Back to Sets
                        </button>
                        <h2 style={{color: 'white', margin: 0}}>{selectedSet.toUpperCase()} Collection</h2>
                    </div>
                    <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        {binderCards.map((card, index) => (
                            <Card 
                                key={`${card.name}-${index}`} 
                                card={card} 
                                width="150px" 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pack View */}
            {view === 'pack' && (
                <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    {pack.map((card, index) => {
                        const uniqueKey = `${card.name}-${card.rarity}-${card.imageUrl}`;
                        const isNew = !ownedCards.has(uniqueKey);

                        return (
                            <Card 
                                key={index} 
                                card={card} 
                                isNew={isNew} 
                                width="200px" 
                            />
                        );
                    })}
                </div>
            )}
        </div>
    )
}

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

export default App