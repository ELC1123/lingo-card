// Utility function to determine card styling based on rarity.
// Centralizes visual decisions for card components so styles remain consistent.
export const getRarityStyle = (rarity) => {
    const r = rarity ? rarity.toLowerCase() : '';

    if(r.includes('hyper') || r.includes('secret') || r.includes('gold')) {
        return { 
            background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', 
            borderColor: '#DAA520', 
            pillColor: '#B8860B', 
            textColor: '#333',
            metaColor: '#555' // Dark grey for Gold cards
        };
    }
        
    if(r.includes('special')) {
        return { 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            borderColor: '#f5576c', 
            pillColor: '#c2185b', 
            textColor: 'white', 
            metaColor: '#ffe4e6'
        };
    }

    if(r.includes('illustration') || r.includes('ultra')) {
        return { 
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', 
            borderColor: '#ff6b6b', 
            pillColor: '#ff6b6b', 
            textColor: '#333',
            metaColor: '#555'
        };
    }

    if(r === 'double rare' || r.includes('double rare') || r.includes('ex') || r.includes('v') || r.includes('vmax')) {
        return { 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderColor: '#667eea', 
            pillColor: '#5b21b6', 
            textColor: 'white',
            metaColor: '#ccc' // Light grey for readability on dark background
        };
    }

    if(r.includes('rare') || r.includes('holo')) {
        return { 
            background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)', 
            borderColor: '#6A5ACD', 
            pillColor: '#6A5ACD', 
            textColor: '#333',
            metaColor: '#555'
        };
    }

    if(r.includes('uncommon')) {
        return { 
            background: '#f0fdf4', 
            borderColor: '#86efac', 
            pillColor: '#166534', 
            textColor: '#064e3b',
            metaColor: '#166534'
        };
    }

    return { 
        background: 'white', 
        borderColor: '#e5e7eb', 
        pillColor: '#6b7280', 
        textColor: '#333',
        metaColor: '#888'
    };
}

// Utility function to extract a numeric card number from an image URL.
// The URL format used by the external API is assumed; this function attempts
// to parse a number segment and falls back to a high value for sorting when
// parsing fails. Returning 999 ensures unknown cards sort to the end.
export const getCardNumber = (url) => {
    try {
        const parts = url.split('/');

        // Some image URLs include the card number in the second-to-last segment.
        // Example: https://.../sets/me01/123/high.webp -> we expect '123' at parts[length-2]
        const numStr = parts[parts.length - 2] || '';

        const parsed = parseInt(numStr.replace(/\D/g, ''), 10);
        return Number.isFinite(parsed) ? parsed : 999;
    } catch (e) {
        // Return sentinel value so callers can handle unknown numbers gracefully
        return 999;
    }
}

// Utility function to style rarity tags
// Small helper returning inline styles for a rarity tag pill.
export const tagStyle = (color) => ({
    display: 'inline-block',
    padding: '4px 8px',
    background: color,
    color: 'white',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    marginTop: '4px'
});