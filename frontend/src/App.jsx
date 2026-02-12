import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [ownedCards, setOwnedCards] = useState(new Set()); // State to track owned card IDs for quick lookup
    const [view, setView] = useState('pack'); // 'pack' or 'binder'

    // Determine card border color based on rarity
    // Determine colors based on rarity
    const getRarityStyle = (rarity) => {
        const r = rarity ? rarity.toLowerCase() : '';

        // 1. GOD TIER (Gold) - Dark text looks best on Gold
        if(r.includes('hyper') || r.includes('secret') || r.includes('gold')) {
             return { 
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', 
                borderColor: '#DAA520', 
                pillColor: '#B8860B',
                textColor: '#333' // Keep Dark
            };
        }
        
        // 2. ART TIER (Pink) - Dark text
        if(r.includes('illustration') || r.includes('special')) {
             return { 
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', 
                borderColor: '#ff6b6b', 
                pillColor: '#ff6b6b',
                textColor: '#333' // Keep Dark
            };
        }

        // 3. DOUBLE RARE TIER (Magenta/Blue) - NEEDS WHITE TEXT
        if(r === 'double rare' || r.includes('double rare')) {
             return { 
                background: 'linear-gradient(135deg, #FF00CC 0%, #333399 100%)', 
                borderColor: '#FF00CC', 
                pillColor: '#C71585',
                textColor: 'white' // <--- FIX IS HERE
            };
        }

        // 4. ULTRA TIER (Silver) - Dark text
        if(r.includes('ultra') || r.includes('ex') || r.includes('v') || r.includes('vmax')) {
             return { 
                background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)', 
                borderColor: '#a0a0a0', 
                pillColor: '#777',
                textColor: '#333'
            };
        }

        // 5. RARE TIER (Purple) - Dark text
        if(r.includes('rare') || r.includes('holo')) {
             return { 
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', 
                borderColor: '#6A5ACD', 
                pillColor: '#6A5ACD',
                textColor: '#333'
            };
        }

        // 6. UNCOMMON TIER - Dark text
        if(r.includes('uncommon')) {
             return { 
                background: '#f0fdf4', 
                borderColor: '#86efac', 
                pillColor: '#166534',
                textColor: '#064e3b' // Dark green text for better contrast
            };
        }

        // 7. COMMON - Dark text
        return { 
            background: 'white', 
            borderColor: '#e5e7eb', 
            pillColor: '#6b7280',
            textColor: '#333'
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

    // Fetch the user's collection from the backend
    const fetchCollection = () => {
        fetch('http://localhost:8080/api/collection')
        .then((response) => response.json())
        .then((data) => {
            // Group cards by name and set code, counting duplicates
            const grouped = data.reduce((acc, card) => {
                const key = `${card.setCode}-${card.name}`;
                if(!acc[key]) {
                    acc[key] = {...card, count: 1};
                } else {
                    acc[key].count += 1;
                }
                return acc;
            }, {});

            // Sort by set code and then by card number extracted from the image URL
            const sortedCollection = Object.values(grouped).sort((a, b) => {
                // extract card number from url
                const getNumberFromURL = (url) => {
                    try {
                        const parts = url.split('/');
                        const numStr = parts[parts.length - 2];
                        return parseInt(numStr.replace(/\D/g, '')) || 999;
                    } catch {
                        return 999;
                    }
                };

                // sort by set code first, then by card number
                const numA = getNumberFromURL(a.imageUrl);
                const numB = getNumberFromURL(b.imageUrl);
                if (a.setCode !== b.setCode) {
                    return a.setCode.localeCompare(b.setCode);
                }

                return numA - numB;
            });

            // Update state with sorted collection and switch to binder view
            setCollection(sortedCollection);
            setView('binder');
        })
        .catch((error) => console.error("Error fetching collection:", error)
        )
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
                <button onClick={fetchCollection} style={buttonStyle('#5e9cff')}>
                    View Collection
                </button>
            </div>

            {/* Header */}
            {view === 'binder' && <h2>My Collection ({collection.length} Cards)</h2>}

            {/* Display the opened pack */}
            <div style = {{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                {(view === 'pack' ? pack : collection).map((card, index) => {
                    const rarityStyle = getRarityStyle(card.rarity);
                    const isBinder = view == 'binder';
                    const cardWidth = isBinder ? '150px' : '200px';

                    // Highlight new cards in the pack (those that have a count of 1, meaning they were just added to the collection)
                    const isNew = view === 'pack' && !ownedCards.has(card.name);

                    return (
                        <div key={index} style={{
                            border: `4px solid ${rarityStyle.borderColor}`,
                            borderRadius: '8px',
                            padding: '10px',
                            width: cardWidth,
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                            background: rarityStyle.background,
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >

                            {/* New Tag */}
                            {isNew && (
                                <div style = {{
                                    position: 'absolute', 
                                    top: '10px', 
                                    left: '-5px',
                                    background: '#4caf50', 
                                    color: 'white',
                                    padding: '2px 8px', 
                                    fontSize: '10px', 
                                    fontWeight: 'bold',
                                    borderRadius: '4px', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    zIndex: 20
                                }}>
                                    NEW!
                                </div>
                            )}

                            {/* Image */}
                            <img src = {card.imageUrl} alt={card.name} style={{width: '100%', borderRadius: '8px'}} />

                            {/* Card Name */}
                            <h3 style={{
                                margin: '8px 0 4px 0', 
                                fontSize: isBinder ? '13px' : '16px', 
                                color: rarityStyle.textColor, 
                                textShadow: rarityStyle.textColor === 'white' ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                                textAlign: 'center'
                            }}>
                                {card.name}
                            </h3>

                            {/* Card Set and Number */}
                            <div style={{fontSize: '11px', color: '#888', margin: '2px 0'}}>
                                {card.setCode.toUpperCase()} • #{getCardNumber(card.imageUrl)}
                            </div>

                            {/* Rarity Tag */}
                            <div style = {tagStyle(rarityStyle.pillColor)}>
                                {card.rarity}
                            </div>

                            {/* Count Badge */}
                            {card.count > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#2196f3',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    border: '2px solid white'
                                }}>
                                    x{card.count}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
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