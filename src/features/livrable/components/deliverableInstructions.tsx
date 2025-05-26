import React from 'react';

const DeliverableInstructions: React.FC = () => {
  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Informations générales</h2>

      {/* Carte informations */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-800 text-1xl tracking-wide">
          Ceci est une chaîne de test aléatoire pour l'affichage des informations générales. 📄
        </p>
      </div>
    </div>
  );
};

export default DeliverableInstructions;