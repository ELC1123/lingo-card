import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack

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

    const openPack = () => {
        fetch('http://localhost:8080/api/packs/open-pack', {method: 'POST'})
        .then((response) => response.json())
        .then((data) => setPack(data))
        .catch((error) => console.error("Error opening pack:", error)
        )
    }

    return (
        <div style={{padding: '20px', textAlign: 'center'}}>
            <h1>Lingo Card Alpha</h1>
            
            {/* Display open pack button */}
            <button onClick={openPack} style={{
                padding: '12px 24px', 
                fontSize: '18px', 
                cursor: 'pointer', 
                backgroundColor: '#ff5e5e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                Open Pack
            </button>

            {/* Display the opened pack */}
            <div style = {{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                marginTop: '30px',
                flexWrap: 'wrap'
            }}>
                {pack.map((card, index) => {
                    const rarityStyle = getRarityStyle(card.rarity);
                
                    return (
                        <div key={index} style={{
                            border: `4px solid ${rarityStyle.borderColor}`,
                            borderRadius: '8px',
                            padding: '10px',
                            width: '180px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            background: rarityStyle.background,
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img src = {card.imageUrl} alt={card.name} style={{width: '100%', borderRadius: '8px'}} />

                            <h3 style={{margin: '10px 0 5px 0', fontSize: '16px', color: '#333'}}>{card.name}</h3>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                {card.rarity}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default App