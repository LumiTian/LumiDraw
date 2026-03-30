import { LearningCard } from '../types';

interface CardProps {
  card: LearningCard;
}

export default function Card({ card }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Step {card.sequence}
        </div>
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {card.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {card.description}
        </p>
      </div>
    </div>
  );
}
