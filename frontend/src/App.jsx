import { useState, useEffect, useCallback, useMemo } from "react";
import './App.css';
import PackView from './views/PackView';
import SetsView from './views/SetsView';
import BinderView from './views/BinderView';
import StudyView from './views/StudyView';
import Navbar from "./components/Navbar";

function App() {
    const [pack, setPack] = useState([]); // State to hold the opened pack
    const [collection, setCollection] = useState([]); // State to hold the user's collection
    const [view, setView] = useState('home'); // 'pack' or 'binder'
    const [selectedSet, setSelectedSet] = useState(false); // State to track the selected set for filtering
    const [loading, setLoading] = useState(false); // State to track loading status
    const [previousOwnedCards, setPreviousOwnedCards] = useState(new Set()); // Track cards owned before opening pack
    const [coins, setCoins] = useState(0); // State to track user's coins

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

    const handleEarnCoins = useCallback((amount) => {
        setCoins(prev => prev + amount);
    }, []);

    // Memoized function to extract unique sets from the collection
    const handleOpenPack = useCallback(() => {
        const PACK_COST = 100; // Define pack cost
        if (coins < PACK_COST) {
            alert("Not enough coins to open a pack!");
            return;
        }

        // Deduct coins immediately
        setCoins(prev => prev - PACK_COST);

        // Save the current owned cards BEFORE opening the pack
        setPreviousOwnedCards(ownedCards);
        setLoading(true);
        fetch('http://localhost:8080/api/packs/open-pack', {method: 'POST'})
            .then((response) => response.json())
            .then((data) => {
                setPack(data);
                setView('pack');
                // Refresh collection to sync owned cards
                fetch('http://localhost:8080/api/collection')
                    .then((res) => res.json())
                    .then((collectionData) => {
                        setCollection(collectionData);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error refreshing collection:", error);
                        setLoading(false);
                    });
            })
            .catch((error) => {
                console.error("Error opening pack:", error);
                setLoading(false);
            });
    }, [coins, ownedCards]);

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
    

    return (
        <div style = {{ minHeight: '100vh', backgroundColor: '#121212'}}>
            {/* Navbar */}
            <Navbar coins={coins} setView={setView} currentView={view} />

            <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center'}}>
                {/* Home View */}
                {view === 'home' && (
                    <div style={{marginTop: '50px', color: 'white'}}>
                        <h1>Welcome to Lingo Card Alpha!</h1>
                        <p style={{ fontSize: '18px', color: '#aaa' }}>Study Mandarin. Earn Packs. Collect 'em all.</p>
                    
                        <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px'}}>
                            <div style={statBoxStyle}>
                                <h2>{collection.length}</h2>
                                <p>Cards Collected</p>
                            </div>
                            <div style={statBoxStyle}>
                                <h2>{coins}</h2>
                                <p>Coins</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setView('study')}
                            style={{
                                marginTop: '40px', padding: '15px 40px', fontSize: '20px', 
                                backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer'
                            }}
                        >
                            Start Studying Now!
                        </button>
                    </div>
                )}

                {/* Sets View */}
                {view === 'sets' && (
                    <SetsView 
                        collection={collection} 
                        onSelectSet={handleViewSetBinder}
                    />
                )}

                {/* Binder View */}
                {view === 'binder' && (
                    <BinderView
                        collection={collection}
                        selectedSet={selectedSet}
                        onBack={handleViewSets}
                    />
                )}

                {/* Pack View */}
                {view === 'pack' && (
                    <div>
                        <div style={{marginBottom: '20px'}}>
                            <button 
                                onClick={handleOpenPack} 
                                disabled={loading || coins < 100}
                                style={{
                                    ...buttonStyle(coins >= 100 ? '#ff5e5e' : '#555'),
                                    cursor: coins >= 100 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {loading ? 'Opening...' : `Open Another Pack (100 💰)`}
                            </button>
                        </div>
                        <PackView 
                            pack={pack} 
                            ownedCards={previousOwnedCards} 
                        />
                    </div>
                )}

                {/* Study View */}
                {view === 'study' && (
                    <StudyView 
                        onEarnCoins={handleEarnCoins}
                    />
                )}
            </div>
        </div>
    )
}

// Simple styles
const statBoxStyle = {
    background: '#2a2a2a', padding: '20px', borderRadius: '15px', width: '200px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
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

export default App