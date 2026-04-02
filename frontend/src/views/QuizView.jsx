import { useState, useEffect, useCallback } from 'react';

/**
 * Quiz view supporting two modes:
 * - "Easy Mode" (MCQ): Multiple choice with 4 options, awards 10 coins per correct answer
 * - "Hard Mode" (Typing): Type pinyin or meaning, awards 25 coins per correct answer
 *
 * Users pick a mode first (mode selection screen), then answer random HSK1 questions.
 */
const QuizView = ({ onEarnCoins, flashcards }) => {
    // null = mode selection screen; 'mcq' or 'typing' = active quiz mode
    const [mode, setMode] = useState(null);

    // Current question card being asked
    const [currentCard, setCurrentCard] = useState(null);

    // Array of 4 options for multiple choice mode (1 correct + 3 random)
    const [options, setOptions] = useState([]);

    // User's typed answer in typing mode
    const [userAnswer, setUserAnswer] = useState('');

    // Feedback object { type: 'correct'|'wrong', msg: string } shown after answer submission
    const [feedback, setFeedback] = useState(null);

    if (!flashcards || flashcards.length === 0) 
        return <div style={{color: 'white'}}>Loading quiz data...</div>;

    // Pick a random card from the HSK1 dataset
    const pickRandomCard = useCallback(() => {
        return flashcards[Math.floor(Math.random() * flashcards.length)];
    }, []);

    // Generate multiple choice options: 1 correct answer + 3 random incorrect ones, shuffled
    const generateMCOptions = useCallback((correctCard) => {
        const wrongOptions = flashcards
            .filter(c => c.id !== correctCard.id)
            .sort(() => 0.5 - Math.random()) // Simple shuffle
            .slice(0, 3); // Take first 3 wrong answers

        // Combine correct and wrong answers, then shuffle again for randomness
        const allOptions = [...wrongOptions, correctCard].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
    }, []);

    // Load the next question: pick a random card and generate options if needed
    const nextQuestion = useCallback(() => {
        const nextCard = pickRandomCard();
        setCurrentCard(nextCard);
        setFeedback(null);
        setUserAnswer('');

        if (mode === 'mcq') {
            generateMCOptions(nextCard);
        }
    }, [mode, pickRandomCard, generateMCOptions]);

    // When mode is selected (or changes), load the first question
    useEffect(() => {
        if (mode) {
            nextQuestion();
        }
    }, [mode, nextQuestion]);

    // Handle multiple choice selection. Check if the selected option matches the current card.
    const handleMcqGuess = (selectedOption) => {
        // Prevent multiple clicks after answer is submitted
        if(feedback) {
            return;
        }

        if(selectedOption.id === currentCard.id) {
            setFeedback({type: 'correct', msg: 'Correct! +10 coins 💰'});
            onEarnCoins(10);
        } else {
            setFeedback({type: 'wrong', msg: `Incorrect! The correct answer was "${currentCard.meaning}"`});
        }
    };

    // Handle typing mode submission. Validate against the meaning (split by '/') or pinyin.
    const handleTypingSubmit = (e) => {
        e.preventDefault();

        // Prevent multiple submissions or empty input
        if(feedback || !userAnswer.trim()) {
            return;
        }

        const guess = userAnswer.trim().toLowerCase();
        // Accept either any part of the meaning (split by '/') or the pinyin as correct
        const validAnswers = currentCard.meaning.toLowerCase().split('/').map(s => s.trim());

        if(validAnswers.includes(guess) || currentCard.pinyin.toLowerCase() === guess) {
            setFeedback({type: 'correct', msg: 'Correct! +25 coins 💰'});
            onEarnCoins(25);
        } else {
            setFeedback({type: 'wrong', msg: `Incorrect! The correct answer was "${currentCard.meaning}"`});
        }
    };    

    // Mode selection screen: user picks Easy (MCQ) or Hard (Typing) mode
    if (!mode) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%'}}>
                <h3 style={{ color: '#aaa', marginBottom: '20px', fontWeight: 'normal'}}>
                    Choose quiz mode!
                </h3>
                <div style={{ display: 'flex', gap: '30px' }}>
                    {/* Easy Mode: Multiple Choice */}
                    <div onClick={() => setMode('mcq')} style={modeBoxStyle('#5e9cff')}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: 'white' }}>Easy Mode</h3>
                        <p style={{ margin: 0, color: '#aaa' }}>Multiple Choice</p>
                        <div style={{ marginTop: '20px', color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>Reward: 10 💰</div>
                    </div>
                    {/* Hard Mode: Typing */}
                    <div onClick={() => setMode('typing')} style={modeBoxStyle('#ff5e5e')}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: 'white' }}>Hard Mode</h3>
                        <p style={{ margin: 0, color: '#aaa' }}>Type the Answer</p>
                        <div style={{ marginTop: '20px', color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>Reward: 25 💰</div>
                    </div>
                </div>
            </div>
        );
    }

    // Active quiz screen: display question, answer UI, and feedback
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth:'600px', margin: '0 auto'}}>
            {/* Header with mode info and difficulty reset button */}
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: 0 }}>
                    ← Change Difficulty
                </button>
                <div style={{ color: '#aaa'}}>
                    {mode === 'mcq' ? 'Multiple Choice (10 💰)' : 'Typing Mode (25 💰)'}
                </div>
            </div>

            {/* Question display: show the Hanzi character */}
            <div style={{ 
                backgroundColor: 'white', width: '100%', padding: '60px 20px', 
                borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom: '20px'
            }}>
                <h1 style={{ fontSize: '100px', margin: 0, color: '#333' }}>{currentCard?.hanzi}</h1>
                <p style={{ color: '#888', margin: '10px 0 0 0' }}>What does this mean?</p>
            </div>

            {/* Feedback banner: shown after question is answered */}
            {feedback && (
                <div style={{
                    width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px',
                    backgroundColor: feedback.type === 'correct' ? '#1b5e20' : '#b71c1c', color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                    {feedback.msg}
                </div>
            )}

            {/* Multiple choice answer options (2x2 grid) */}
            {mode === 'mcq' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%'}}>
                    {options.map((opt, i) => (
                        <button 
                            key={`opt-${opt.id}`} 
                            onClick={() => handleMcqGuess(opt)} 
                            disabled={feedback !== null}
                            style={{
                                padding: '15px', fontSize: '18px', cursor: feedback ? 'default' : 'pointer',
                                backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '8px',
                                transition: 'all 0.2s', opacity: feedback ? 0.6 : 1
                            }}
                        >
                            {opt.meaning}
                        </button>
                    ))}
                </div>
            )}

            {/* Typing mode: text input + submit button */}
            {mode === 'typing' && (
                <form onSubmit={handleTypingSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '15px' }}>
                    <input 
                        type="text" 
                        value={userAnswer} 
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type the pinyin or meaning..."
                        disabled={feedback !== null}
                        style={{
                            flex: 1, padding: '15px 20px', fontSize: '18px', borderRadius: '8px', 
                            border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white', outline: 'none'
                        }}
                        autoFocus
                    />
                    <button 
                        type="submit"  
                        disabled={feedback !== null || !userAnswer.trim()} 
                        style={{ 
                            padding: '0 30px', fontSize: '18px', backgroundColor: '#5e9cff', color: 'white', 
                            border: 'none', borderRadius: '8px', cursor: (feedback !== null || !userAnswer.trim()) ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold', opacity: (feedback !== null || !userAnswer.trim()) ? 0.5 : 1
                        }}
                    >
                        Submit
                    </button>
                </form>
            )}

            {/* Next question button shown only after feedback is given */}
            {feedback && (
                <button 
                    onClick={nextQuestion}
                    style={{marginTop: '10px', padding: '15px 30px', fontSize: '20px', backgroundColor: '#4caf50', 
                        color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', 
                        boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'}}
                >
                    Next Question →
                </button>
            )}
        </div>
    );
};

// Style helper function for mode selection boxes
const modeBoxStyle = (borderColor) => ({
    padding: '30px', 
    backgroundColor: '#1a1a1a', 
    border: `2px solid ${borderColor}`, 
    borderTop: `6px solid ${borderColor}`,
    borderRadius: '10px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    width: '250px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)', 
    transition: 'transform 0.2s'
});

export default QuizView;