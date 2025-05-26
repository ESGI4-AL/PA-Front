import React, { useState } from 'react';

const SubmissionConfiguration: React.FC = () => {
  const [deadline, setDeadline] = useState('');
  const [allowLate, setAllowLate] = useState(false);
  const [latePenalty, setLatePenalty] = useState('0.1');
  const [penaltyUnit, setPenaltyUnit] = useState<'hours' | 'days'>('hours');
  const [submissionTypes, setSubmissionTypes] = useState<{ archive: boolean; git: boolean }>({
    archive: false,
    git: false,
  });
  const [minGroupSize, setMinGroupSize] = useState(1);
  const [maxGroupSize, setMaxGroupSize] = useState(3);
  const isGroupSizeInvalid = minGroupSize > maxGroupSize;

  const toggleSubmissionType = (type: 'archive' | 'git') => {
    setSubmissionTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-8">&gt; Configuration du rendu</h2>

      {/* Carte */}
      <div className="bg-white rounded-lg shadow p-6 text-gray-800 text-lg font-medium space-y-8">
        
        {/* Date de rendu */}
        <div className="flex flex-col">
          <label className="mb-2 text-xl font-semibold">Date de rendu du projet</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2 border rounded text-gray-900"
          />
        </div>

        {/* Bloc rendu en retard + pénalité */}
        <div className="space-y-4">
          {/* Autoriser les retards */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">Autoriser les rendus en retard</span>
            <button
              onClick={() => setAllowLate(!allowLate)}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition bg-gradient-to-r ${
                allowLate ? 'from-red-600 to-pink-500' : 'from-gray-400 to-gray-400'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
                  allowLate ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Si autorisé : réglage du malus */}
          {allowLate && (
            <div className="flex flex-col space-y-2">
              <label className="text-xl font-semibold">Pénalité de retard</label>
              <div className="flex items-center space-x-4">
                <select
                  value={latePenalty}
                  onChange={(e) => setLatePenalty(e.target.value)}
                  className="px-4 py-2 border rounded"
                >
                  {Array.from({ length: 40 }, (_, i) => (i + 1) * 0.1).map((val) => (
                    <option key={val} value={val.toFixed(1)}>
                      {val.toFixed(1)}
                    </option>
                  ))}
                </select>
                <span className="text-lg">point(s) perdu(s) par</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPenaltyUnit('hours')}
                    className={`px-4 py-2 rounded border text-white font-semibold transition ${
                      penaltyUnit === 'hours'
                        ? 'bg-gradient-to-r from-red-600 to-pink-500'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    heure
                  </button>
                  <button
                    onClick={() => setPenaltyUnit('days')}
                    className={`px-4 py-2 rounded border text-white font-semibold transition ${
                      penaltyUnit === 'days'
                        ? 'bg-gradient-to-r from-red-600 to-pink-500'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    jour
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Types de rendu */}
        <div>
          <label className="text-xl font-semibold mb-2 block">Type de rendu</label>
          <div className="flex space-x-8">
            {['archive', 'git'].map((type) => {
              const isChecked = submissionTypes[type as 'archive' | 'git'];
              return (
                <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSubmissionType(type as 'archive' | 'git')}
                    className="w-5 h-5 accent-red-600"
                  />
                  <span
                    className={`relative transition-all duration-300 after:transition-all after:duration-300
                      ${
                        isChecked
                          ? 'after:content-[""] after:absolute after:left-0 after:-bottom-1 after:h-[3px] after:w-full after:bg-gradient-to-r after:from-red-500 after:to-pink-400'
                          : 'after:content-[""] after:absolute after:left-0 after:-bottom-1 after:h-[3px] after:w-0 after:bg-gradient-to-r after:from-red-500 after:to-pink-400 group-hover:after:w-full'
                      }
                    `}
                  >
                    {type === 'archive' ? 'Archive (.tar ou .zip)' : 'Dépôt Git (lien repository github)'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Nombre de membres par groupe */}
        <div>
          <label className="text-xl font-semibold mb-2 block">Taille des groupes</label>
          <div className="flex items-center space-x-2 text-lg">
            <span>Le rendu sera fait par des groupes de</span>
            <select
              value={minGroupSize}
              onChange={(e) => setMinGroupSize(Number(e.target.value))}
              className={`px-3 py-1 border rounded ${
                isGroupSizeInvalid ? 'border-red-500' : ''
              }`}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span>à</span>
            <select
              value={maxGroupSize}
              onChange={(e) => setMaxGroupSize(Number(e.target.value))}
              className={`px-3 py-1 border rounded ${
                isGroupSizeInvalid ? 'border-red-500' : ''
              }`}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span>membre(s).</span>
          </div>
          
          {/* Message d’erreur */}
          {isGroupSizeInvalid && (
            <p className="text-red-600 mt-2 text-sm font-medium">
              ⚠️ Le nombre minimum ne peut pas être supérieur au nombre maximum.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionConfiguration;