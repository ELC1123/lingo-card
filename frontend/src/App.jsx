import { useState, useEffect } from "react";
import './App.css';

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch('http://localhost:8080/api/hello')
            .then((response) => response.text())
            .then((data) => setMessage(data))
            .catch((error) => console.error("Error connecting to Spring Boot:", error));
    }, [])

    return (
        <div style={{padding: '50px', textAlign: 'center'}}>
            <h1>Lingo Card Alpha</h1>
            <h3>Connection Status: </h3>

            {/* If there is a message, show in blue. Otherwise, show loading text */}
            <h2 style={{ color: '#646CFF'}}>
                {message ? message : "Connecting to backend..."}
            </h2>
        </div>
    )
}

export default App