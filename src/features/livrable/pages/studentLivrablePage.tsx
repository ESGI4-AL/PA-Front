import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';
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

  const groupId = '63eda8a5-6a99-4d5e-8a4b-5b8c1e832751'; // TODO : À rendre dynamique
  const deliverableId = '98040338-453b-4ca2-b82d-50fb58fb06ab'; // TODO : À rendre dynamique

  useEffect(() => {
    const fetchData = async () => {
      try {

        // const token = localStorage.getItem('token');
        // const headers = { Authorization: `Bearer ${token}` };
        const headers = {}; // TODO : Ajouter token si besoin

        // 1. Récupération du projet via le groupe
        const projectRes = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/project`,
          { headers }
        );
        const projectId = projectRes.data?.data?.id;
        if (!projectId) {
          console.error('Project ID not found');
          return;
        }

        // 2. Récupération des livrables
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

        // 3. Récupération des membres du groupe
        const groupRes = await axios.get(
          `http://localhost:3000/api/groups/${groupId}`,
          { headers }
        );
        const students = groupRes.data?.data?.members || [];
        setMembers(students);

        // 4. Récupération de la soutenance
        const presentationRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/presentations`,
          { headers }
        );
        const allPresentations = presentationRes.data?.data || [];
        const groupDefense = allPresentations.find((p: any) => p.groupId === groupId);
        if (groupDefense) {
          setDefense(groupDefense);
        }

        // 5. Récupération du rapport
        const reportRes = await axios.get(
          `http://localhost:3000/api/projects/${projectId}/groups/${groupId}/report`,
          { headers }
        );
        if (reportRes.data?.data) {
          setReport(reportRes.data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className="leading-normal tracking-normal text-white min-h-screen bg-gradient-to-b from-red-500 to-pink-300 pb-24"
      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed w-full z-30 top-0 text-white bg-gradient-to-b from-red-500 to-pink-300 bg-opacity-90 backdrop-blur-md shadow-md">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className="pl-4 flex items-center">
            <Link
              to="/"
              className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            >
              <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
              <span className="mt-4">Kōdō</span>
            </Link>
          </div>
        </div>
        <hr className="border-b border-white opacity-25 my-0 py-0" />
      </nav>

      {/* Timer */}
      <div className="pt-20">
        <DeadlineBanner deadline={deadline} />
      </div>

      {/* Main Content */}
      <DeliverableSubject deliverable={deliverable} />
      <TeamMembers members={members} />
      <DelivrableDefense defense={defense} />
      <ReportEditor report={report} setReport={setReport} />
      <DeliverableUpload />
    </div>
  );
};

export default StudentLivrablePage;