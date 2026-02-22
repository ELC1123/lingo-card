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
    const [coins, setCoins] = useState(() => {
        const savedCoins = localStorage.getItem('coins');
        return savedCoins != null ? parseInt(savedCoins, 10) : 0;
    }); // State to track user's coins

    useEffect(() => {
        localStorage.setItem('coins', coins);
    }, [coins]);

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
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#121212' }}>
            
            {/* Navbar */}
            <Navbar coins={coins} setView={setView} currentView={view} />

            {/* Main Content Area */}
            <div style={{ padding: '0 50px 50px 50px', width: '100%' }}>
                
                {/* Dashboard / Home View */}
                {view === 'home' && (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', 
                            paddingBottom: '30px', marginBottom: '30px', paddingTop: '20px' }}>
                            {/* Left Side Info */}
                            <div>
                                <h1 style={{fontSize: '48px', margin: '0 0 10px 0'}}>Welcome!</h1>
                                <p style={{ fontSize: '18px', color: '#aaa', margin: 0 }}>Study Mandarin. Earn Packs. Master your collection.</p>
                                
                                <button
                                    onClick={() => setView('study')}
                                    style={{
                                        marginTop: '30px', padding: '12px 30px', fontSize: '18px', 
                                        backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    Jump to Study →
                                </button>
                            </div>
                            
                            {/* Right Side Stats */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={statBoxStyle}>
                                    <h2 style={{fontSize: '40px', margin: 0, color: '#5e9cff'}}>{collection.length}</h2>
                                    <p style={{margin: '5px 0 0 0', color: '#888', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold'}}>Total Cards</p>
                                </div>
                                <div style={statBoxStyle}>
                                    <h2 style={{fontSize: '40px', margin: 0, color: '#FFD700'}}>{coins}</h2>
                                    <p style={{margin: '5px 0 0 0', color: '#888', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold'}}>Available Coins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sets View */}
                {view === 'sets' && (
                    <div style={{ width: '100%' }}>
                        <SetsView collection={collection} onSelectSet={handleViewSetBinder} />
                    </div>
                )}

                {/* Binder View */}
                {view === 'binder' && (
                    <div style={{ width: '100%' }}>
                        <BinderView collection={collection} selectedSet={selectedSet} onBack={handleViewSets} />
                    </div>
                )}

                {/* Pack View */}
                {view === 'pack' && (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px', paddingTop: '20px'}}>
                            <h2 style={{ margin: 0 }}>Booster Packs</h2>
                            <button 
                                onClick={handleOpenPack} 
                                disabled={loading || coins < 100}
                                style={{
                                    ...buttonStyle(coins >= 100 ? '#ff5e5e' : '#333'),
                                    cursor: coins >= 100 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {loading ? 'Opening...' : `Open Pack (100 💰)`}
                            </button>
                        </div>
                        
                        {pack.length === 0 ? (
                            <div style={{ color: '#555', fontSize: '18px' }}>Ready to pull? Buy a pack above.</div>
                        ) : (
                            <PackView pack={pack} ownedCards={previousOwnedCards} />
                        )}
                    </div>
                )}

                {/* Study View */}
                {view === 'study' && (
                    <div style={{ width: '100%' }}>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px', paddingTop: '20px' }}>
                            <h2 style={{ margin: 0 }}>HSK 1 Study Session</h2>
                        </div>
                        <StudyView onEarnCoins={handleEarnCoins} />
                    </div>
                )}
            </div>
        </div>
    )
}

// Update styles for a flatter, desktop feel
const statBoxStyle = {
    background: '#1a1a1a', padding: '20px', width: '150px',
    border: '1px solid #2a2a2a', borderLeft: '4px solid #444', textAlign: 'left'
};

const buttonStyle = (color) => ({
    padding: '10px 20px', fontSize: '16px', cursor: 'pointer', 
    backgroundColor: color, color: 'white', border: 'none', 
    borderRadius: '4px', fontWeight: 'bold'
});

export default App