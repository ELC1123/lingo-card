import { useState } from 'react';

const AuthView = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            const data = await response.text();

            if(!response.ok) {
                throw new Error(data || 'Authentication failed');
            }

            if(isLoginMode) {
                const parsedData = JSON.parse(data);
                onLogin(parsedData.token, parsedData.username);
            } else {
                setIsLoginMode(true);
                setError('Register Successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style = {{ background: '#1a1a1a', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333' }}>
                <h2 style = {{ textAlign: 'center', margin: '0 0 30px 0', color: '#fff' }}>
                    {isLoginMode ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div style = {{padding: '10px', marginBottom: '20px', borderRadius: '5px', backgroundColor: error.includes('Successful') ? '#1b5e20' : '#b71c1c', color: 'white', textAlign: 'center'}}>
                        {error}
                    </div>
                )}

                <form onSubmit = {handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <input 
                        type="text"
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input 
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" disabled={isLoading || !username || !password} style={buttonStyle}>
                        {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button 
                        onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#5e9cff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isLoginMode ? "Need an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white', outline: 'none'
};

const buttonStyle = {
    padding: '15px', fontSize: '18px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
};

export default AuthView;