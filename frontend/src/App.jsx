import { useState, useEffect, useCallback, useMemo } from "react";
import './App.css';
import PackView from './views/PackView';
import SetsView from './views/SetsView';
import BinderView from './views/BinderView';
import StudyView from './views/StudyView';
import Navbar from "./components/Navbar";
import QuizView from "./views/QuizView";
import AuthView from "./views/AuthView";

function App() {
    const [pack, setPack] = useState([]);                   // pack opening state
    const [collection, setCollection] = useState([]);       // collection state
    const [view, setView] = useState('home');               // view state - 'home', 'pack', 'sets', 'binder', 'study', 'quiz'
    const [selectedSet, setSelectedSet] = useState(false);  // Currently selected set code for the binder view. false means none selected.

    // Loading indicator used around network actions
    const [loading, setLoading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);

    const [previousOwnedCards, setPreviousOwnedCards] = useState(new Set());    // Snapshot of owned cards before opening a pack — used to determine "NEW" badges
    const [token, setToken] = useState(() => sessionStorage.getItem('lingo_token'));
    const [username, setUsername] = useState(() => sessionStorage.getItem('lingo_username'));
    
    const handleLogin = (newToken, newUsername) => {
        sessionStorage.setItem('lingo_token', newToken);
        sessionStorage.setItem('lingo_username', newUsername);
        setToken(newToken);
        setUsername(newUsername);
        setView('home');
    };
    
    const handleLogout = () => {
        sessionStorage.removeItem('lingo_token');
        sessionStorage.removeItem('lingo_username');
        setToken(null);
        setUsername(null);
        setCoins(0);
        setCollection([]);
        setView('home');
    };

    const [coins, setCoins] = useState(0);

    const fetchUserProfile = useCallback(async () => {
        if(!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const userData = await response.json();
                setCoins(userData.coins);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }, [token]);

    // Update coins when earned
    const handleEarnCoins = useCallback(async (amount) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/earn?amount=${amount}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`}
            });
            if (response.ok) {
                const newBalance = await response.json();
                setCoins(newBalance);
            }
        } catch (error) {
            console.error("Error earning coins:", error);
        }
    }, [token]);

    // State to track owned cards for "NEW!" badge logic
    const ownedCards = useMemo(() => {
        return new Set(collection.map(c => {
            return `${c.name}-${c.rarity}-${c.imageUrl}`; // Unique identifier for each card variant
        }));
    }, [collection]);

    // Function to refresh collection data from the backend
    const refreshCollection = useCallback(() => {
        if (!token) {
            // nothing to do when not authenticated
            return;
        }
        setLoading(true);
        fetch('http://localhost:8080/api/collection', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch collection (${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setCollection(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching collection:", error);
                setLoading(false);
            });
    }, [token]);

    // Fetch collection on initial load (or when login occurs)
    useEffect(() => {
        if (token) {
            refreshCollection();
            fetchUserProfile();
        }
    }, [refreshCollection, fetchUserProfile,token]);

    // Memoized function to extract unique sets from the collection
    const handleOpenPack = useCallback(async () => {
        const PACK_COST = 100; // Define pack cost
        if (coins < PACK_COST) {
            alert("Not enough coins to open a pack!");
            return;
        }

        // Save the current owned cards BEFORE opening the pack
        setPreviousOwnedCards(ownedCards);
        setLoading(true);

        const sse = new EventSource('http://localhost:8080/api/packs/stream-progress');
        sse.addEventListener('progress', (e) => {
            const data = JSON.parse(e.data);
            setDownloadProgress(data);
        })

        try {
            const response = await fetch('http://localhost:8080/api/packs/open-pack', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Pack open failed (${response.status})`);
            }

            const data = await response.json();

            setPack(data);
            setView('pack');

            fetchUserProfile();
            refreshCollection();
        } catch (error) {
            console.error("Error opening pack: ", error);
            setLoading(false);
            alert("Failure to open pack. Are you connected to the server?");
        } finally {
            sse.close();
            setDownloadProgress(null);
            setLoading(false);
        }
    }, [coins, ownedCards, token, refreshCollection, fetchUserProfile]);

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
            
            {!token ? (
                <AuthView onLogin={handleLogin} />
            ) : (
                <>
                    {/* Navbar */}
                    <Navbar coins={coins} setView={setView} currentView={view} onLogout = {handleLogout} />

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

                                    {/* Conditionally show normal button OR the progress bar */}
                                    {downloadProgress ? (
                                        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>
                                                <span>{downloadProgress.status}</span>
                                                {/* Display Current / Total */}
                                                <span>{downloadProgress.current} / {downloadProgress.total}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    // Calculate the width percentage dynamically for the CSS
                                                    width: `${Math.floor((downloadProgress.current / downloadProgress.total) * 100)}%`, 
                                                    height: '100%', 
                                                    background: 'linear-gradient(90deg, #4caf50, #81c784)',
                                                    transition: 'width 0.2s linear' 
                                                }} />
                                            </div>
                                        </div>
                                    ) : (
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
                                    )}
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

                        {/* Quiz View */}
                        {view === 'quiz' && (
                            <div style={{ width: '100%' }}>
                                <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px', paddingTop: '20px' }}>
                                    <h2 style={{ margin: 0 }}>Quiz</h2>
                                </div>
                                <QuizView onEarnCoins={handleEarnCoins} />
                            </div>
                        )}
                    </div>
                </>
            )}
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