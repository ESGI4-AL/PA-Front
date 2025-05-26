import React, { useState } from 'react';

const DeliverableSubject: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="mt-16 mb-8 max-w-4xl mx-auto px-6">
      {/* Titre section */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Sujet du livrable</h2>

      {/* Carte */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-800 text-lg font-medium">
        
        {/* Champ titre */}
        <div>
          <label className="block text-xl font-semibold mb-2">Titre du livrable</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded text-gray-900"
          />
        </div>

        {/* Champ description */}
        <div>
          <label className="block text-xl font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded text-gray-900"
          />
        </div>

        {/* Upload sujet */}
        <div>
          <label className="inline-block cursor-pointer px-5 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded font-semibold hover:brightness-110 transition">
            Choisir un fichier
            <input
                type="file"
                accept=".pdf,.zip,.rar"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default DeliverableSubject;