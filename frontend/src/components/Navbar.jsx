// Top-level navigation bar displayed across the app. Shows navigation buttons and coin count.
const Navbar = ({ coins, setView, currentView, onLogout }) => {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 30px', backgroundColor: '#181818', color: 'white',
            borderBottom: '1px solid #2a2a2a'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div onClick={() => setView('home')}
                    style={{fontSize: '24px', fontWeight: 'bold', 
                        cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: '10px'}}>
                    <span style={{ fontSize: '28px' }}>🎴</span> LingoCard
                </div>
                {/* Navigation Links */}
                <div style={{display: 'flex', gap: '20px', fontSize: '16px'}}>
                    <NavButton label="Open Packs" active={currentView === 'pack'} onClick={() => setView('pack')} />
                    <NavButton label="Collection" active={currentView === 'sets' || currentView === 'binder'} onClick={() => setView('sets')} />
                    <NavButton label="Study" active={currentView === 'study'} onClick={() => setView('study')} />
                    <NavButton label="Quiz" active={currentView === 'quiz'} onClick={() => setView('quiz')} />
                </div>
            </div>

            {/* Coin Display */}
            <div style={{
                backgroundColor: '#333', padding: '8px 16px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #444'
            }}>
                <div style={{ background: '#333', padding: '8px 15px', borderRadius: '20px', color: '#FFD700', fontWeight: 'bold' }}>
                    💰 {coins}
                </div>
                <button
                    onClick = {onLogout}
                    style={{
                        background: 'transparent',
                        color : '#ff5e5e',
                        border: '1px solid #ff5e5e',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 94, 94, 0.1)'}
                    onMouseOut = {(e) => e.target.style.background = 'transparent'}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

// Small presentational button used by Navbar. Inline styles keep it dependency-free.
const NavButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            color: active ? '#4caf50' : '#aaa', // Green if active
            fontSize: '16px',
            fontWeight: active ? 'bold' : 'normal',
            cursor: 'pointer',
            padding: '5px 10px',
            borderBottom: active ? '2px solid #4caf50' : '2px solid transparent',
            transition: 'all 0.2s'
        }}
    >
        {label}
    </button>
);

export default Navbar;