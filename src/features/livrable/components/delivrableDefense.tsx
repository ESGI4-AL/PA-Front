import React from 'react';

const DelivrableDefense: React.FC = () => {
  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Soutenance</h2>

      {/* Carte d’infos */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-800 text-lg font-medium">
        <p>
          <span className="font-semibold">📅 Date :</span> 28 juin 2025 à 14h00
        </p>
        <p>
          <span className="font-semibold">⏱️ Durée :</span> 30 minutes
        </p>
        <p>
          <span className="font-semibold">🏫 Salle :</span> Bâtiment A - Salle 204
        </p>
      </div>
    </div>
  );
};

export default DelivrableDefense;
