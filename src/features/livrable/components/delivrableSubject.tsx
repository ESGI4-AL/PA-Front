import React from 'react';

interface DeliverableSubjectProps {
  deliverable: any | null;
}

const DeliverableSubject: React.FC<DeliverableSubjectProps> = ({ deliverable }) => {
  if (!deliverable) return null;

  return (
    <div className="mt-32 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Sujet</h2>

      {/* Bloc de téléchargement */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-800 text-lg font-semibold mb-4 sm:mb-0">
          Télécharger l'énoncé au format PDF :
        </p>
        <a
          href={deliverable?.documentUrl || '/documents/sujet-projet.pdf'} // <-- dynamique ici
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold px-4 py-2 rounded hover:brightness-110 transition"
        >
          Télécharger le sujet
        </a>
      </div>

      {/* Bloc de lecture directe du sujet */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-800 text-lg font-semibold mb-2">Intitulé du sujet :</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {deliverable?.description ||
            'Aucune description fournie pour ce livrable.'}
        </p>
      </div>
    </div>
  );
};

export default DeliverableSubject;