import React from 'react';

interface SubjectSubjectProps {
  deliverable: any | null;
}

const ProjectSubject: React.FC<SubjectSubjectProps> = ({ deliverable }) => {
  if (!deliverable) return null;

  return (
    <div className="mt-4 mb-16 w-full px-0">
      {/* Titre */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">&gt; Sujet</h2>

      {/* Bloc de téléchargement */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <p className="text-gray-800 text-base md:text-lg font-semibold mb-4 md:mb-0">
          Télécharger l'énoncé au format PDF :
        </p>
        <a
          href={deliverable?.documentUrl || '/documents/sujet-projet.pdf'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold px-4 py-2 rounded hover:brightness-110 transition"
        >
          Télécharger le sujet
        </a>
      </div>

      {/* Bloc de lecture directe du sujet */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-800 text-base md:text-lg font-semibold mb-2">
          Intitulé du sujet :
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {deliverable?.description || 'Aucune description fournie pour ce livrable.'}
        </p>
      </div>
    </div>
  );
};

export default ProjectSubject;