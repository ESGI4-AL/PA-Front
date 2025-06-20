import React from 'react';

interface DefenseProps {
  defense: {
    startTime: string;
    duration?: number;
    location?: string;
  } | null;
}

const ProjectDefense: React.FC<DefenseProps> = ({ defense }) => {
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
    <div className="mt-4 mb-16 w-full px-0">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">&gt; Soutenance</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-800 text-base md:text-lg font-medium">
        <p>
          <span className="font-semibold">Date :</span> {formatted}
        </p>
        <p>
          <span className="font-semibold">Durée :</span> {defense.duration || 30} minutes
        </p>
        <p>
          <span className="font-semibold">Salle :</span>{' '}
          {defense.location || 'Non précisée'}
        </p>
      </div>
    </div>
  );
};

export default ProjectDefense;