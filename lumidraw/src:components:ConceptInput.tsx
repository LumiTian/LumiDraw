import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ConceptInputProps {
  onGenerate: (concept: string) => void;
  isLoading: boolean;
}

export default function ConceptInput({ onGenerate, isLoading }: ConceptInputProps) {
  const [concept, setConcept] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (concept.trim() && !isLoading) {
      onGenerate(concept.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Enter a concept or knowledge to learn... (e.g., Photosynthesis, Quantum Mechanics)"
          className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none shadow-sm transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!concept.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-orange-500 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
