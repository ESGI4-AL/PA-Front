import React, { useState } from 'react';

interface DeliverableUploadProps {
  allowGitLink?: boolean;
}

const DeliverableUpload: React.FC<DeliverableUploadProps> = ({ allowGitLink = true }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [gitLink, setGitLink] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.zip') || file.name.endsWith('.tar'))) {
      setFileName(file.name);
    } else {
      setFileName(null);
      alert('Seuls les fichiers .zip ou .tar sont autorisés.');
    }
  };

  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Dépôt du livrable</h2>

      {/* Zone de dépôt */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <p className="text-gray-800 text-lg font-medium mb-4">
            Déposez votre fichier ici (.zip ou .tar uniquement)
          </p>

          <input
            type="file"
            accept=".zip,.tar"
            onChange={handleFileChange}
            className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-white file:bg-gradient-to-r file:from-red-600 file:to-pink-600 hover:file:brightness-110 transition"
          />

          {fileName && (
            <p className="mt-4 text-green-700 font-semibold">
              ✅ Fichier sélectionné : {fileName}
            </p>
          )}
        </div>

        {allowGitLink && (
          <div>
            <p className="text-gray-800 text-lg font-medium mb-2">
              Et / Ou saisissez le lien vers votre dépôt Git :
            </p>
            <input
              type="url"
              value={gitLink}
              onChange={(e) => setGitLink(e.target.value)}
              placeholder="https://github.com/votre-projet"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold px-6 py-3 rounded hover:brightness-110 transition"
          >
            Valider le dépôt
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliverableUpload;