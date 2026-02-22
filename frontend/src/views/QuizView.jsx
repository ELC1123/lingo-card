import { useState, useEffect, useCallback } from 'react';
import { HSK1_DATA } from '../data/hsk1data';

const QuizView = ({ onEarnCoins }) => {
    const [mode, setMode] = useState(null); // multiple choice or typing
    const [currentCard, setCurrentCard] = useState(null); // The card currently being quizzed
    const [options, setOptions] = useState([]); // Multiple choice options
    const [userAnswer, setUserAnswer] = useState(''); // User's input for typing mode
    const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'

    // pick random card from HSK1_DATA when mode is selected
    const pickRandomCard = useCallback(() => {
        return HSK1_DATA[Math.floor(Math.random() * HSK1_DATA.length)];
    }, []);

    // generate options for multiple choice (1 correct + 3 random incorrect)
    const generateMCOptions = useCallback((correctCard) => {
        const wrongOptions = HSK1_DATA
            .filter(c => c.id !== correctCard.id)
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 3); // Take first 3

        const allOptions = [...wrongOptions, correctCard].sort(() => 0.5 - Math.random()); // Shuffle again
        setOptions(allOptions);
    }, []);

    const nextQuestion = useCallback(() => {
        const nextCard = pickRandomCard();
        setCurrentCard(nextCard);
        setFeedback(null);
        setUserAnswer('');

        if (mode === 'mcq') {
            generateMCOptions(nextCard);
        }
    }, [mode, pickRandomCard, generateMCOptions]);

    useEffect(() => {
        if (mode) {
            nextQuestion();
        }
    }, [mode, nextQuestion]);

    const handleMcqGuess = (selectedOption) => {
        if(feedback) {
            return;
        }

        if(selectedOption.id === currentCard.id) {
            setFeedback({type: 'correct', message: 'Correct! +10 coins'});
            onEarnCoins(10);
        } else {
            setFeedback({type: 'incorrect', message: `Incorrect! The correct answer was "${currentCard.meaning}"`});
        }
    };

    const handleTypingSubmit = (e) => {
        e.preventDefault();

        if(feedback || !userAnswer.trim()) {
            return;
        }

        const guess = userAnswer.trim().toLowerCase();
        const validAnswers = currentCard.meaning.toLowerCase().split('/').map(s => s.trim());

        if(validAnswers.includes(guess) || currentCard.pinyin.toLowerCase() === guess) {
            setFeedback({type: 'correct', message: 'Correct! +25 coins'});
            onEarnCoins(25);
        } else {
            setFeedback({type: 'incorrect', message: `Incorrect! The correct answer was "${currentCard.meaning}"`});
        }
    };    

    if (!mode) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%'}}>
                <h3 style={{ color: '#aaa', marginBottom: '20px', fontWeight: 'normal'}}>
                    Choose quiz mode!
                </h3>
                <div onClick={() => setMode('mcq')} style={modeBoxStyle('#5e9cff')}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: 'white' }}>Easy Mode</h3>
                    <p style={{ margin: 0, color: '#aaa' }}>Multiple Choice</p>
                    <div style={{ marginTop: '20px', color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>Reward: 10 💰</div>
                </div>
                <div onClick={() => setMode('typing')} style={modeBoxStyle('#ff5e5e')}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: 'white' }}>Hard Mode</h3>
                    <p style={{ margin: 0, color: '#aaa' }}>Type the Answer</p>
                    <div style={{ marginTop: '20px', color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>Reward: 25 💰</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth:'600px', margin: '0 auto'}}>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: 0 }}>
                    ← Change Difficulty
                </button>
                <div style={{ color: '#aaa'}}>
                    {mode === 'mcq' ? 'Multiple Choice (10 💰)' : 'Typing Mode (25 💰)'}
                </div>
            </div>

            <div style={{ 
                backgroundColor: 'white', width: '100%', padding: '60px 20px', 
                borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom: '30px'
            }}>
                <h1 style={{ fontSize: '100px', margin: 0, color: '#333' }}>{currentCard?.hanzi}</h1>
                <p style={{ color: '#888', margin: '10px 0 0 0' }}>What does this mean?</p>
            </div>

            {feedback && (
                <div style={{
                    width: '100%', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px',
                    backgroundColor: feedback.type === 'correct' ? '#1b5e20' : '#b71c1c', color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                    {feedback.msg}
                </div>
            )}

            {mode === 'mcq' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%'}}>
                    {options.map((opt, i) => (
                        <button key = {i} onClick={() => handleMcqGuess(opt)} disabled={feedback !== null}
                        style={{
                            padding: '20px', fontSize: '18px', cursor: feedback ? 'default' : 'pointer',
                            backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '8px',
                            transition: 'all 0.2s', opacity: feedback ? 0.6 : 1
                        }}
                    >
                        {opt.meaning}
                    </button>
                    ))}
                </div>
            )}

            {mode === 'typing' && (
                <form onSubmit={handleTypingSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <input type="text" value={userAnswer} 
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type the pinyin or meaning..."
                        disabled={feedback !== null}
                        style={{
                            flex: 1, padding: '15px', fontSize: '18px', borderRadius: '8px', 
                            border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                    <button type="submit" disabled={feedback !== null || !userAnswer.trim()} 
                        style={{ padding: '0 25px', fontSize: '18px', backgroundColor: '#5e9cff', color: 'white', 
                        border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Submit
                    </button>
                </form>
            )}

            {feedback && (
                <button onClick={nextQuestion}
                    style={{marginTop: '30px', padding: '15px 40px', fontSize: '20px', backgroundColor: '#4caf50', 
                        color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', 
                        boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'}}>
                    Next Question →
                </button>
            )}
        </div>
    );
};

// UI style helper for the mode selection boxes
const modeBoxStyle = (borderColor) => ({
    padding: '30px', backgroundColor: '#1a1a1a', border: `2px solid ${borderColor}`, borderTop: `6px solid ${borderColor}`,
    borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width: '250px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)', transition: 'transform 0.2s'
});

export default QuizView;