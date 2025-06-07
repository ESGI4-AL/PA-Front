import React from 'react';

interface DefenseProps {
  defense: {
    startTime: string;
    duration?: number;
    location?: string;
  } | null;
}

const DelivrableDefense: React.FC<DefenseProps> = ({ defense }) => {
  if (!defense) return null;

  const date = new Date(defense.startTime);
  const formatted = date.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Soutenance</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-800 text-lg font-medium">
        <p>
          <span className="font-semibold">📅 Date :</span> {formatted}
        </p>
        <p>
          <span className="font-semibold">⏱️ Durée :</span> {defense.duration || 30} minutes
        </p>
        <p>
          <span className="font-semibold">🏫 Salle :</span>{' '}
          {/* defense.location ? defense.location : 'Non précisée' */}
          Non précisée {/* décommenter ici quand "location" sera dispo */}
        </p>
      </div>
    </div>
  );
};

export default DelivrableDefense;