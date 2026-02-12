import { useState, useEffect } from "react";
import './App.css';
import Card from './components/Card';
import { getCardNumber } from './utils/cardHelper'; // You still need this for sorting!

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [ownedCards, setOwnedCards] = useState(new Set()); // State to track owned card IDs for quick lookup
    const [view, setView] = useState('pack'); // 'pack' or 'binder'
    const [selectedSet, setSelectedSet] = useState(null); // State to track the selected set for filtering

    const setMetadata = {
        'me01':  { logo: 'https://assets.tcgdex.net/en/me/me01/logo.png', total: 188 },          // mega evolution set
        'swsh1': { logo: 'https://assets.tcgdex.net/en/swsh/swsh1/logo.png', total: 202 },
        'sv1':   { logo: 'https://assets.tcgdex.net/en/sv/sv1/logo.png', total: 198 },
        'default': { logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg', total: 100 }
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
    // Update this function in App.jsx
    const getSetsFromCollection = () => {
        const sets = {};
        if (!Array.isArray(collection)) return [];

        collection.forEach(card => {
            const code = card.setCode;
            const meta = setMetadata[code.toLowerCase()] || setMetadata['default'];

            if(!sets[code]) {
                sets[code] = { 
                    code: code, 
                    uniqueCards: new Set(), // Track unique card names here
                    coverImage: meta.logo,
                    totalSetSize: meta.total,
                    isLogo: !!setMetadata[code.toLowerCase()] 
                };
            }
            // Add card name to the Set (Sets automatically block duplicates!)
            sets[code].uniqueCards.add(card.name);
        });

        // Convert to array and format for display
        return Object.values(sets).map(set => ({
            ...set,
            progress: set.uniqueCards.size // This is the final unique count
        }));
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
                                <div style={{color: '#aaa', fontSize: '14px', fontWeight: 'bold'}}>
                                    Progress: <span style={{color: '#4caf50'}}>{set.progress}</span> / {set.totalSetSize}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Binder View */}
            {view === 'binder' && (
                <div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                        <button onClick={fetchSets} style={{...buttonStyle('#888'), padding: '5px 15px', fontSize: '12px'}}>
                            ← Back to Sets
                        </button>
                        <h2 style={{color: 'white', margin: 0}}>
                            {selectedSet.toUpperCase()} Collection
                        </h2>
                    </div>

                    <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        {getBinderCards().map((card, index) => {
                            return (
                                <Card 
                                    key={index} 
                                    card={card} 
                                    width="150px" 
                                />
                            )
                        })}
                    </div>
                </div>
                
            )}
                
            {/* Pack View */}
            {view === 'pack' && (
                <div style = {{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    {pack.map((card, index) => {
                        return (
                            <Card 
                                key={index} 
                                card={card} 
                                isNew={!ownedCards.has(card.name)} 
                                width="200px" 
                            />
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

export default App