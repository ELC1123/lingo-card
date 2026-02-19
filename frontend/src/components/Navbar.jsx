const Navbar = ({ coins, setView, currentView}) => {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 20px', backgroundColor: '#1e1e1e', color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)', borderBottom: '2px solid #444',
            marginBottom: '30px'
        }}>
            {/* Logo & Title */}
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
                <NavButton label="Study HSK" active={currentView === 'study'} onClick={() => setView('study')} />
            </div>

            {/* Coin Display */}
            <div style={{
                backgroundColor: '#333', padding: '8px 16px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #444'
            }}>
                <span>💰</span>
                <span style={{fontWeight: 'bold', fontSize: '18px', color: '#FFD700'}}>
                    {coins}
                </span>
            </div>
        </div>
    );
};

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