import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack

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
            <button onClick={openPack} style={{padding: '10px 20px', fontSize: '16px', cursor: 'pointer'}}>
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
                {pack.map((card, index) => (
                    <div key={index} style={{
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        width: '150px',
                        boxShadow: '2px 2px 12px rgba(0,0,0,0.1)',
                        background: card.rarity === 'Ultra Rare' ? 'gold' : 'white'
                    }}>
                        <img src = {card.imageUrl} alt={card.name} style={{width: '100%', borderRadius: '4px'}} />
                        <h3 style={{ color: '#f54d4d' }}>{card.name}</h3>
                        <p style={{ color: '#555' }}>{card.rarity}</p>
                        <p style={{ color: '#613838' }}>Set: {card.setCode}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App