import { useState } from 'react';
import { HSK1_DATA } from '../data/hsk1data';

/**
 * Simple flashcard-style study view. Clicking the card flips it to reveal pronunciation
 * and example usage. Each "Next" grants the user some coins (via `onEarnCoins`).
 */
const StudyView = ({onEarnCoins}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentCard = HSK1_DATA[currentIndex];

    // Advance to the next card and reward the user for studying
    const handleNext = () => {
        onEarnCoins(10);
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % HSK1_DATA.length);
        }, 150);
    };

    // Move back to the previous card
    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + HSK1_DATA.length) % HSK1_DATA.length);
        }, 150);
    }

    const faceStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
    }

    return (
        // Aligned top-left for desktop
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            
            <div style={{color: '#888', marginBottom: '20px', fontSize: '18px'}}>
                Card {currentIndex + 1} / {HSK1_DATA.length}
            </div>

            {/* This wrapper holds the card size rigid so it doesn't squash */}
            <div style={{ position: 'relative', width: '550px', height: '400px', perspective: '1000px' }}>
                <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{
                        position: 'relative', width: '100%', height: '100%', cursor: 'pointer',
                        textAlign: 'center', transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front Face */}
                    <div style={{ ...faceStyle, backgroundColor: 'white' }}>
                        <h1 style={{fontSize: '80px', color: '#333', margin: 0}}>{currentCard.hanzi}</h1>
                        <div style={{position: 'absolute', bottom: '20px', color: '#aaa', fontSize: '14px'}}>(Click to Flip)</div>
                    </div>

                    {/* Back Face */}
                    <div style={{ ...faceStyle, backgroundColor: '#f8f9fa', transform: 'rotateY(180deg)' }}>
                        <h1 style={{fontSize: '80px', color: '#333', margin: 0}}>{currentCard.hanzi}</h1>
                        <h2 style={{color: '#e91e63', fontSize: '32px', marginBottom: '5px'}}>{currentCard.pinyin}</h2>
                        <h3 style={{color: '#333', marginTop: '0', marginBottom: '20px'}}>{currentCard.meaning}</h3>

                        <div style={{textAlign: 'left', width: '100%', padding: '10px', background: '#eee', borderRadius: '8px'}}>
                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold', color: '#555'}}>Example:</p>
                            <p style={{margin: '0', fontSize: '16px', color: '#333'}}>{currentCard.sentence}</p>
                            <p style={{margin: '5px 0 0 0', fontSize: '14px', color: '#666', fontStyle: 'italic'}}>{currentCard.sentenceMeaning}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{marginTop: '30px', display: 'flex', gap: '15px', width: '350px', justifyContent: 'space-between'}}>
                <button onClick={handlePrev} style={controlButtonStyle}>← Prev</button>
                <button onClick={handleNext} style={{...controlButtonStyle, backgroundColor: '#4caf50', flex: 1, marginLeft: '10px'}}>Next (+10 💰)</button>
            </div>
        </div>
    );
};

const controlButtonStyle = {
    padding: '10px 25px', fontSize: '16px', cursor: 'pointer',
    backgroundColor: '#444', color: 'white', border: 'none',
    borderRadius: '8px', fontWeight: 'bold'
};

export default StudyView;