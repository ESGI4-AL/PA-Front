import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '@/shared/layouts/Sidebar';

import DeadlineBanner from '../components/deadlineBanner';
import DeliverableSubject from '../components/delivrableSubject';
import DeliverableUpload from '../components/delivrableUpload';
import TeamMembers from '../components/teamMembers';
import DelivrableDefense from '../components/delivrableDefense';
import ReportEditor from '../components/reportEditor';

const StudentLivrablePage: React.FC = () => {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [deliverable, setDeliverable] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [defense, setDefense] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);

  const groupId = '63eda8a5-6a99-4d5e-8a4b-5b8c1e832751';
  const deliverableId = '98040338-453b-4ca2-b82d-50fb58fb06ab';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {};

        const projectRes = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/project`,
          { headers }
        );
        const projectId = projectRes.data?.data?.id;
        if (!projectId) return;

        const deliverableRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/deliverables`,
          { headers }
        );
        const deliverables = deliverableRes.data?.data || [];
        const target = deliverables.find((d: any) => d.id === deliverableId);
        if (target) {
          setDeliverable(target);
          const rawDate = new Date(target.deadline);
          const correctedDate = new Date(rawDate.getTime() - 2 * 60 * 60 * 1000);
          setDeadline(correctedDate);
        }

        const groupRes = await axios.get(
          `http://localhost:3000/api/groups/${groupId}`,
          { headers }
        );
        setMembers(groupRes.data?.data?.members || []);

        const presentationRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/presentations`,
          { headers }
        );
        const groupDefense = (presentationRes.data?.data || []).find(
          (p: any) => p.groupId === groupId
        );
        if (groupDefense) setDefense(groupDefense);

        const reportRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/groups/${groupId}/report`,
          { headers }
        );
        if (reportRes.data?.data) setReport(reportRes.data.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-100 font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar role="student" />

      {/* Main content */}
      <main className="ml-64 w-full px-10 py-6">
        {/* Breadcrumbs */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
          <div>
            Projets / Détails / <span className="text-black font-medium">Aperçu</span>
          </div>
          <Link to="/projects" className="border px-3 py-1 rounded hover:bg-gray-100">
            Retour
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 text-sm font-medium">
          <button className="bg-pink-100 text-red-600 px-3 py-1 rounded">Aperçu</button>
          <button className="hover:underline">Modifier le projet</button>
          <button className="hover:underline">Groupes</button>
          <button className="hover:underline">Livrables</button>
          <button className="hover:underline">Rapports</button>
          <button className="hover:underline">Soutenances</button>
          <button className="hover:underline">Évaluations</button>
        </div>

        {/* Page content */}
        <div className="space-y-6">
          <DeadlineBanner deadline={deadline} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeliverableSubject deliverable={deliverable} />
            <div className="bg-white shadow rounded p-4 text-sm text-gray-700">
              <ul className="list-disc list-inside">
                <li>Temps restant</li>
                <li>Télécharger le sujet en PDF</li>
                <li>Description du sujet</li>
                <li>Statistiques</li>
                <li>Date de soutenance</li>
              </ul>
            </div>
          </div>
          <TeamMembers members={members} />
          <DelivrableDefense defense={defense} />
          <ReportEditor report={report} setReport={setReport} />
          <DeliverableUpload />
        </div>
      </main>
    </div>
  );
};

export default StudentLivrablePage;