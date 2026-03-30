import { LearningCard } from '../types';
import Card from './Card';

interface CardGridProps {
  cards: LearningCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Your Visual Learning Journey
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
