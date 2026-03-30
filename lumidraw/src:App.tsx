import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { LearningCard } from './types';
import CardGrid from './components/CardGrid';
import ConceptInput from './components/ConceptInput';

function App() {
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCards = async (concept: string) => {
    setIsLoading(true);
    setError(null);
    setCards([]);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cards`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cards');
      }

      const data = await response.json();
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-orange-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              LumiDraw
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform any concept into visual learning cards
          </p>
        </header>

        <ConceptInput
          onGenerate={handleGenerateCards}
          isLoading={isLoading}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Creating your visual learning journey...</p>
          </div>
        )}

        {!isLoading && cards.length > 0 && (
          <CardGrid cards={cards} />
        )}
      </div>
    </div>
  );
}

export default App;
