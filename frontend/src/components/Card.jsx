import { getRarityStyle, getCardNumber, tagStyle } from "../utils/cardHelper";

const Card = ({ card, isNew = false, width = '200px'}) => {
    const rarityStyle = getRarityStyle(card.rarity);
    const borderThickness = width === '200px' ? '4px' : '1px';

    return (
        <div style={{
            border: `${borderThickness} solid ${rarityStyle.borderColor}`,
            borderRadius: '12px', padding: '10px',
            width: width,
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)', 
            background: rarityStyle.background,
            position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
            transition: 'transform 0.2s', cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {isNew && (
                <div style={{
                    position: 'absolute', top: '10px', left: '-5px',
                    background: '#4caf50', color: 'white', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
                    borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 20
                }}>NEW!</div>
            )}
            <img src={card.imageUrl} style={{width: '100%', borderRadius: '8px'}} />
            <h3 style={{
                margin: '8px 0 4px 0', fontSize: '16px', textAlign: 'center',
                color: rarityStyle.textColor,
                textShadow: rarityStyle.textColor === 'white' ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
            }}>
                {card.name}
            </h3>

            <div style={{fontSize: '10px', color: rarityStyle.metaColor, margin: '2px 0'}}>
                {card.setCode.toUpperCase()} • #{getCardNumber(card.imageUrl)}
            </div>

            <div style={tagStyle(rarityStyle.pillColor)}>{card.rarity}</div>

            {card.count > 0 && (
                <div style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: '#333', color: 'white', borderRadius: '50%',
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '11px', border: '2px solid white'
                }}>
                    {card.count}
                </div>
            )}
        </div>
    );
};

export default Card;