"use client";
import { useState } from 'react';

interface WeatherResult {
  city: string;
  days: number;
  average_temperature: string;
}

export default function Home() {
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);    

    try {
      const baseUrl = process.env.NEXT_PUBLIC_WEATHER_BE_BASE_URL;
      if (!baseUrl) throw new Error('API base URL not configured');

      const url = new URL('/weather/average', baseUrl);
      url.searchParams.set('city', city);
      url.searchParams.set('days', days);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Average Weather Temperature</h1>

        <form onSubmit={handleSubmit} className="gap-y-4 grid grid-cols-5">
          <div className='self-center col-span-1'>City:</div>
          <input
            type="text"
            placeholder="Kuala Lumpur"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded-md col-span-4"
          />
          <div className='self-center col-span-1'>Past days:</div>
          <input
            type="number"
            placeholder="10"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            required
            className="w-full border border-gray-300 p-2 rounded-md col-span-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 col-span-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Getting...' : 'Get Average'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Result</h2>
            <p><strong>City:</strong> {result.city}</p>
            <p><strong>Days:</strong> {result.days}</p>
            <p><strong>Average Temperature:</strong> {result.average_temperature}°C</p>
          </div>
        )}
      </div>
    </main>
  );
}
