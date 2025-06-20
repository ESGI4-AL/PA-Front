import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/useAuth';
import DeadlineBanner from '../components/DeadlineBanner';
import ProjectSubject from '../components/ProjectSubject';
import TeamMembers from '../components/TeamMembers';
import ProjectDefense from '../components/ProjectDefense';
import DeliverableUpload from '../components/DelivrableUpload';
import ReportEditor from '../components/ReportEditor'; // ✅ Ajouté ici
import logger from '@/utils/logger';

const StudentProjectsDetailPage: React.FC = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();

  const [deadline, setDeadline] = useState<Date | null>(null);
  const [deliverable, setDeliverable] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [defense, setDefense] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null); // ✅ Ajouté ici
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabLabels: Record<string, string> = {
    overview: 'Détails',
    edit: 'Modifier le projet',
    groups: 'Groupes',
    deliverables: 'Livrables',
    reports: 'Rapports',
    presentations: 'Soutenances',
    evaluations: 'Évaluations',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!projectId || !user?.id || !token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const groupsRes = await axios.get(`http://localhost:3000/api/projects/${projectId}/groups`, { headers });
        const groups = groupsRes.data?.data || [];

        const myGroup = groups.find((group: any) =>
          group.members?.some((member: any) => member.id === user.id)
        );

        if (!myGroup) return;

        const groupId = myGroup.id;
        setMembers(myGroup.members || []);

        const deliverablesRes = await axios.get(`http://localhost:3000/api/projects/${projectId}/deliverables`, { headers });
        const deliverables = deliverablesRes.data?.data || [];
        const target = deliverables[0];

        if (target) {
          setDeliverable(target);
          const rawDate = new Date(target.deadline);
          const correctedDate = new Date(rawDate.getTime() - 2 * 60 * 60 * 1000);
          setDeadline(correctedDate);
        }

        const presentationRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/presentations`,
          { headers }
        );
        const groupDefense = (presentationRes.data?.data || []).find(
          (p: any) => p.groupId === groupId
        );
        if (groupDefense) {
          setDefense(groupDefense);
        }

        // ✅ Récupération du rapport existant
        const reportRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/groups/${groupId}/report`,
          { headers }
        );
        setReport(reportRes.data?.data || null);

      } catch (error) {
        logger.error('Erreur lors du chargement des données :', error);
      }
    };

    fetchData();
  }, [projectId, user?.id]);

  return (
    <div className="flex min-h-screen bg-neutral-100 font-sans text-gray-900">
      <main className="ml-64 w-full py-6">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Fil d’ariane */}
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <div className="space-x-1">
              <span className="text-gray-400">Tableau de bord</span>
              <span>/</span>
              <span className="text-gray-400">Projets</span>
              <span>/</span>
              <span className="font-medium text-black">{tabLabels[selectedTab]}</span>
            </div>
            <Link
              to="/student/projects/my-projects"
              className="border border-red-200 text-red-500 px-3 py-1 rounded hover:bg-red-50"
            >
              Retour
            </Link>
          </div>

          {/* Onglets */}
          <div className="bg-red-50 inline-flex rounded-md px-1 py-1.5 mb-10">
            {[
              { label: 'Aperçu', key: 'overview' },
              { label: 'Groupes', key: 'groups' },
              { label: 'Livrables', key: 'deliverables' },
              { label: 'Rapports', key: 'reports' },
              { label: 'Soutenances', key: 'presentations' },
              { label: 'Évaluations', key: 'evaluations' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-1.5 text-sm rounded ml-2 first:ml-0 ${
                  selectedTab === tab.key
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-red-600 hover:underline'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu selon l’onglet actif */}
          <div className="space-y-6">
            {selectedTab === 'overview' && (
              <>
                <DeadlineBanner deadline={deadline} />
                <ProjectSubject deliverable={deliverable} />
                <ProjectDefense defense={defense} />
                <TeamMembers members={members} />
              </>
            )}

            {selectedTab === 'groups' && <TeamMembers members={members} />}

            {selectedTab === 'deliverables' && <DeliverableUpload />}

            {selectedTab === 'presentations' && <ProjectDefense defense={defense} />}

            {selectedTab === 'reports' && (
              <ReportEditor report={report} setReport={setReport} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProjectsDetailPage;