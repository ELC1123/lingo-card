import Card from '../components/Card';

/**
 * Display cards from a recently opened pack. Marks cards as "NEW" when they
 * were not present in the provided `ownedCards` set.
 */
const PackView = ({ pack, ownedCards }) => {
    return (
        <div style={{justifyContent: 'center', flexWrap: 'wrap', display: 'flex', gap: '20px'}}>
            {pack.map((card) => {
                const uniqueKey = `${card.name}-${card.rarity}-${card.imageUrl}`;
                const isNew = !ownedCards.has(uniqueKey);

                // Use a stable key derived from card properties to avoid React reordering issues
                const key = `${card.name}-${card.rarity}-${card.imageUrl}`;

                return (
                    <Card 
                        key={key} 
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