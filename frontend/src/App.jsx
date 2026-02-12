import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [ownedCards, setOwnedCards] = useState(new Set()); // State to track owned card IDs for quick lookup
    const [view, setView] = useState('pack'); // 'pack' or 'binder'
    const [selectedSet, setSelectedSet] = useState(null); // State to track the selected set for filtering

    const SetLogos = {
        'me01': 'https://assets.tcgdex.net/en/me/me01/logo.png',           // mega evolution set

        'swsh1': 'https://assets.tcgdex.net/en/swsh/swsh1/logo.png',       // sword and shield base set

        'sv1': 'https://assets.tcgdex.net/en/sv/sv1/logo.png',             // scarlet and violet base set
        // Add more sets here as you collect them!
        'default': 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg'
    }

    // Function to determine card styling based on rarity
    const getRarityStyle = (rarity) => {
        const r = rarity ? rarity.toLowerCase() : '';

        if(r.includes('hyper') || r.includes('secret') || r.includes('gold')) {
             return { 
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', 
                borderColor: '#DAA520', 
                pillColor: '#B8860B', 
                textColor: '#333',
                metaColor: '#555' // Dark grey for Gold cards
            };
        }
        
        if(r.includes('special')) {
             return { 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                borderColor: '#f5576c', 
                pillColor: '#c2185b', 
                textColor: 'white', 
                metaColor: '#ffe4e6'
            };
        }

        if(r.includes('illustration') || r.includes('ultra')) {
             return { 
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', 
                borderColor: '#ff6b6b', 
                pillColor: '#ff6b6b', 
                textColor: '#333',
                metaColor: '#555'
            };
        }

        // 3. DOUBLE RARE (The dark one)
        if(r === 'double rare' || r.includes('double rare') || r.includes('ex') || r.includes('v') || r.includes('vmax')) {
             return { 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderColor: '#667eea', 
                pillColor: '#5b21b6', 
                textColor: 'white',
                metaColor: '#ccc' // Light grey for readability on dark background
            };
        }

        if(r.includes('rare') || r.includes('holo')) {
             return { 
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', 
                borderColor: '#6A5ACD', 
                pillColor: '#6A5ACD', 
                textColor: '#333',
                metaColor: '#555'
            };
        }

        if(r.includes('uncommon')) {
             return { 
                background: '#f0fdf4', 
                borderColor: '#86efac', 
                pillColor: '#166534', 
                textColor: '#064e3b',
                metaColor: '#166534'
            };
        }

        return { 
            background: 'white', 
            borderColor: '#e5e7eb', 
            pillColor: '#6b7280', 
            textColor: '#333',
            metaColor: '#888'
        };
    }

    // Extract card number from image URL for display
    const getCardNumber = (url) => {
        try {
            const parts = url.split('/');
            const numStr = parts[parts.length - 2];
            return parseInt(numStr.replace(/\D/g, '')) || 999;
        } catch (e) {
            return '??';
        }
    }

    // Fetch a new pack from the backend
    const openPack = () => {
        fetch('http://localhost:8080/api/collection')
        .then((res) => res.json())
        .then(currentCollection => {
            // Create a set of owned card names for quick lookup
            const owned = new Set(currentCollection.map(c => c.name));
            setOwnedCards(owned);
            return fetch('http://localhost:8080/api/packs/open-pack', {method: 'POST'});
        })
        .then((response) => response.json())
        .then((data) => {
            setPack(data);
            setView('pack');
            // setCollection([]); // Clear collection view when opening a new pack
        })   
        .catch((error) => console.error("Error opening pack:", error)
        )
    }

    // Fetch the user's collection from the backend and group by sets
    const fetchSets = () => {
        fetch('http://localhost:8080/api/collection')
        .then((response) => response.json())
        .then((data) => {
            setCollection(data);
            setView('sets');
        })
        .catch((error) => console.error("Error fetching sets:", error)
        )
    }

    // When a set is clicked, filter the collection to show only cards from that set
    const viewSetBinder = (setCode) => {
        setSelectedSet(setCode);
        setView('binder');
    }

    // Group collection by set and count cards in each set
    const getSetsFromCollection = () => {
        const sets = {};
        collection.forEach(card => {
            const code = card.setCode;
            if(!sets[code]) {
                sets[code] = {
                    code: code,
                    count: 0,
                    coverImage: SetLogos[code.toLowerCase()] || SetLogos['default'],
                    isLogo: !!SetLogos[code.toLowerCase()]
                };
            }
            sets[code].count += 1;
        });
        return Object.values(sets);
    }

    // Fetch the user's collection from the backend
    const getBinderCards = () => {
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
    }

    return (
        <div style={{padding: '10px', textAlign: 'center'}}>
            {/* Main Title */}
            <h1>
                Lingo Card Alpha
            </h1>
            
            {/* Open Pack & View Collection Buttons */}
            <div style={{marginBottom: '30px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <button onClick={openPack} style={buttonStyle('#ff5e5e')}>
                    Open Pack
                </button>
                <button onClick={fetchSets} style={buttonStyle('#5e9cff')}>
                    My Collection
                </button>
            </div>

            {/* Sets View */}
            {view === 'sets' && (
                <div>
                    <h2 style = {{color: 'white', marginBottom: '10px'}}>
                        Select a Set
                    </h2>

                    <div style = {{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {getSetsFromCollection().map((set) => (
                            <div key={set.code} 
                                onClick={() => viewSetBinder(set.code)} 
                                style={{
                                    border: '1px solid #ddd', 
                                    borderRadius: '12px', 
                                    padding: '15px',
                                    width: '160px', 
                                    cursor: 'pointer', 
                                    background: '#2a2a2a',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style = {{
                                    height: '100px', 
                                    width: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '15px'
                                }}>
                                    <img src={set.coverImage} alt={set.code} style={{
                                        maxWidth: '100%', 
                                        maxHeight: '100%', 
                                        borderRadius: set.isLogo ? '0' : '6px', 
                                        objectFit: 'contain',
                                        filter: set.isLogo ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                                    }} />
                                </div>
                                <h3 style = {{margin: '10px 0 5px 0', fontSize: '18px'}}>
                                    {set.code.toUpperCase()}
                                </h3>
                                <span style={{fontSize: '12px', color: '#888', background: '#f0f0f0', padding: '4px 8px', borderRadius: '10px'}}>
                                    {set.count} Cards Owned
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Binder View */}
            {view === 'binder' && (
                <div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                        <button onClick={fetchSets} style={{...buttonStyle('#888'), padding: '5px 15px', fontSize: '12px'}}>
                            ← Back to Sets
                        </button>
                        <h2 style={{color: 'white', margin: 0}}>
                            {selectedSet.toUpperCase()} Collection
                        </h2>
                    </div>

                    <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        {getBinderCards().map((card, index) => {
                            const rarityStyle = getRarityStyle(card.rarity);

                            return (
                                <div key={index} style={{
                                    border: `1px solid #ddd`, borderRadius: '12px', padding: '10px',
                                    width: '150px', // Binder Size
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', background: rarityStyle.background,
                                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}>
                                    <img src={card.imageUrl} style={{width: '100%', borderRadius: '8px'}} />
                                    
                                    <h3 style={{
                                        margin: '8px 0 4px 0', fontSize: '13px', textAlign: 'center',
                                        color: rarityStyle.textColor,
                                        textShadow: rarityStyle.textColor === 'white' ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                                    }}>
                                        {card.name}
                                    </h3>

                                    <div style={{fontSize: '10px', color: rarityStyle.metaColor, margin: '2px 0'}}>
                                        {card.setCode.toUpperCase()} • #{getCardNumber(card.imageUrl)}
                                    </div>

                                    <div style={tagStyle(rarityStyle.pillColor)}>
                                        {card.rarity}
                                    </div>

                                    {card.count > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            background: '#333', color: 'white', borderRadius: '50%',
                                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '11px', border: '2px solid white'
                                        }}>{card.count}</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                
            )}
                
            {/* Pack View */}
            {view === 'pack' && (
                <div style = {{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    {pack.map((card, index) => {
                        const rarityStyle = getRarityStyle(card.rarity);
                        const isNew = !ownedCards.has(card.name);
                        return (
                            <div key={index} style={{
                                border: `4px solid ${rarityStyle.borderColor}`, borderRadius: '12px', padding: '10px',
                                width: '200px', // Pack Size
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: rarityStyle.background,
                                position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                transition: 'transform 0.2s', cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {isNew && (
                                    <div style={{
                                        position: 'absolute', top: '10px', left: '-5px',
                                        background: '#4caf50', color: 'white', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
                                        borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 20
                                    }}>NEW!</div>
                                )}
                                <img src={card.imageUrl} style={{width: '100%', borderRadius: '8px'}} />
                                <h3 style={{
                                    margin: '8px 0 4px 0', fontSize: '16px', textAlign: 'center',
                                    color: rarityStyle.textColor,
                                    textShadow: rarityStyle.textColor === 'white' ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                                }}>
                                    {card.name}
                                </h3>
                                <div style={tagStyle(rarityStyle.pillColor)}>{card.rarity}</div>
                            </div>
                        )
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

const tagStyle = (color) => ({
    display: 'inline-block',
    padding: '4px 8px',
    background: color,
    color: 'white',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    marginTop: '4px'
});

export default App