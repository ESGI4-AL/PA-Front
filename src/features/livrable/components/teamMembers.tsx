import React from 'react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface TeamMembersProps {
  members: Member[];
}

const TeamMembers: React.FC<TeamMembersProps> = ({ members }) => {
  return (
    <div className="mt-16 mb-16 max-w-4xl mx-auto px-6">
      {/* Titre */}
      <h2 className="text-4xl font-bold text-white mb-6">&gt; Membres</h2>

      {/* Carte membres */}
      <div className="bg-white rounded-lg shadow p-6">
        <ul className="list-disc pl-6 text-gray-800 text-xl font-semibold tracking-wide space-y-2">
          {members.map((member) => (
            <li key={member.id}>
              {member.lastName} {member.firstName}
            </li>
          ))}
        </ul>

        {/* Bouton ajout visuel uniquement */}
        <div className="mt-6 flex justify-end">
          <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold px-6 py-3 rounded hover:brightness-110 transition">
            + S'ajouter au groupe
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;