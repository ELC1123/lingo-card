import { useState } from 'react';
import { HSK1_DATA } from '../data/hsk1data';

const StudyView = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentCard = HSK1_DATA[currentIndex];

    // Added a flip animation for better UX
    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % HSK1_DATA.length);
        }, 150);
    };

    // Added a previous button for better navigation
    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + HSK1_DATA.length) % HSK1_DATA.length);
        }, 150);
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: '20px'
        }}>
            <h2 style={{color: 'white', marginBottom: '20px'}}>HSK 1 Study Mode</h2>

            {/* Progress Bar */}
            <div style={{color: '#888', marginBottom: '10px'}}>
                Card {currentIndex + 1} / {HSK1_DATA.length}
            </div>

            <div
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                    perspective: '1000px', width: '300px', height: '350px', cursor: 'pointer',
                }}
            >
                <div style={{
                    position: 'relative', width: '100%', height: '100%',
                    textAlign: 'center', transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden', // Hides this side when flipped
                        backgroundColor: 'white', borderRadius: '15px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                        <h1 style={{fontSize: '80px', color: '#333', margin: 0}}>
                            {currentCard.hanzi}
                        </h1>
                        <div style={{position: 'absolute', bottom: '20px', color: '#aaa', fontSize: '14px'}}>
                            (Click to Flip)
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden',
                        backgroundColor: '#f8f9fa', borderRadius: '15px',
                        transform: 'rotateY(180deg)', // Initially rotated away
                        display: 'flex', flexDirection: 'column', 
                        alignItems: 'center', justifyContent: 'center', padding: '20px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                        <h1 style={{fontSize: '80px', color: '#333', margin: 0}}>
                            {currentCard.hanzi}
                        </h1>
                        <h2 style={{color: '#e91e63', fontSize: '32px', marginBottom: '5px'}}>
                            {currentCard.pinyin}
                        </h2>
                        <h3 style={{color: '#333', marginTop: '0', marginBottom: '20px'}}>
                            {currentCard.meaning}
                        </h3>

                        <div style={{textAlign: 'left', width: '100%', padding: '10px', background: '#eee', borderRadius: '8px'}}>
                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold', color: '#555'}}>Example:</p>
                            <p style={{margin: '0', fontSize: '16px', color: '#333'}}>{currentCard.sentence}</p>
                            <p style={{margin: '5px 0 0 0', fontSize: '14px', color: '#666', fontStyle: 'italic'}}>
                                {currentCard.sentenceMeaning}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{marginTop: '50px', display: 'flex', gap: '20px'}}>
                <button onClick={handlePrev} style={controlButtonStyle}>← Prev</button>
                <button onClick={handleNext} style={controlButtonStyle}>Next →</button>
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