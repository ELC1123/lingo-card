import { useState, useEffect, useCallback, useMemo } from "react";
import './App.css';
import PackView from './views/PackView';
import SetsView from './views/SetsView';
import BinderView from './views/BinderView';
import StudyView from './views/StudyView';

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
                <button onClick={() => setView('study')} style={buttonStyle('#4caf50')} disabled={loading}>
                    Study HSK 1
                </button>
            </div>

            {view === 'sets' && (
                <SetsView 
                    collection={collection} 
                    onSelectSet={handleViewSetBinder}
                />
            )}

            {view === 'binder' && (
                <BinderView
                    collection={collection}
                    selectedSet={selectedSet}
                    onBack={handleViewSets}
                />
            )}

            {/* Pack View */}
            {view === 'pack' && (
                <PackView 
                    pack={pack} 
                    ownedCards={ownedCards} 
                />
            )}

            {/* Study View */}
            {view === 'study' && (
                <StudyView />
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