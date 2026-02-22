import Card from '../components/Card';

const PackView = ({ pack, ownedCards }) => {
    return (
        <div style={{justifyContent: 'center', flexWrap: 'wrap', display: 'flex', gap: '20px'}}>
            {pack.map((card, index) => {
                const uniqueKey = `${card.name}-${card.rarity}-${card.imageUrl}`;
                const isNew = !ownedCards.has(uniqueKey);

                return (
                    <Card 
                        key={index} 
                        card={card} 
                        isNew={isNew} 
                        width="200px" 
                    />
                );
            })}
        </div>
    );
};

export default PackView;