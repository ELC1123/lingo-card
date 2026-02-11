import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [view, setView] = useState('pack'); // 'pack' or 'binder'

    // Determine card border color based on rarity
    const getRarityStyle = (rarity) => {
        const r = rarity ? rarity.toLowerCase() : '';

        if(r.includes('ultra') || r.includes('secret') || r.includes('illustration')) {
            return { background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', borderColor: '#DAA520' }; // Gold Gradient
        }
        if(r.includes('rare') || r.includes('holo')) {
            return { background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', borderColor: '#6A5ACD' }; // Holo/Purple-Blue
        }
        return { background: 'white', borderColor: '#ccc' };
    }

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
        fetch('http://localhost:8080/api/packs/open-pack', {method: 'POST'})
        .then((response) => response.json())
        .then((data) => {
            setPack(data);
            setView('pack');
            setCollection([]); // Clear collection view when opening a new pack
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

                const numA = getNumberFromURL(a.imageUrl);
                const numB = getNumberFromURL(b.imageUrl);

                // sort by set code first, then by card number
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
            <h1>
                Lingo Card Alpha
            </h1>
            
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
                            <img src = {card.imageUrl} alt={card.name} style={{width: '100%', borderRadius: '8px'}} />

                            <h3 style={{margin: '10px 0 5px 0', fontSize: '16px', color: '#333'}}>
                                {card.name}
                            </h3>

                            <div style={{fontSize: '11px', color: '#888', margin: '2px 0'}}>
                                {card.setCode.toUpperCase()} • #{getCardNumber(card.imageUrl)}
                            </div>

                            <div style = {tagStyle}>
                                {card.rarity}
                            </div>
                            {card.count > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#ff5e5e',
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

const tagStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333'
};

export default App