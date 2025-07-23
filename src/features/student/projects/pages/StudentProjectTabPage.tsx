import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useStudentProjects } from "../hooks/useStudentProjects";
import { toast } from "sonner";
import StudentProjectDetailTab from "../components/ProjectDetail/StudentProjectDetailTab";
import StudentProjectGroupsTab from "../components/Groups/StudentProjectGroupsTab";
import StudentProjectDeliverablesTab from "../components/Deliverables/StudentProjectDeliverablesTab";
import StudentProjectPresentationsTab from "../components/Presentations/StudentProjectPresentationsTab";
import StudentProjectEvaluationTab from "../components/Evaluations/StudentProjectEvaluationTab";
import StudentProjectRepportsTab from "../components/Repports/StudentProjectRepportsTab";


const StudentProjecTabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("detail");
  const [projectName, setProjectName] = useState("");

  const {
    fetchProjectById,
    loading,
    error,
    clearError
  } = useStudentProjects();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          toast.error("ID de projet invalide");
          navigate("/student/projects");
          return;
        }

        const project = await fetchProjectById(id);
        if (project) {
          setProjectName(project.name);
        } else {
          toast.error("Projet non trouvé");
          navigate("/student/projects");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du projet:", err);
        toast.error("Erreur lors du chargement du projet");
        navigate("/student/projects");
      }
    };

    fetchProject();
  }, [id, fetchProjectById, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  if (loading) {
    return (
      <div className="container mx-auto pb-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pb-6">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p>{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => navigate("/student/projects")}>
            Retour aux projets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-6">
      <div className="flex justify-between items-center mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student/projects/my-projects">Mes Projets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>{projectName || "Détails"}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate("/student/projects/my-projects")}>
          Retour
        </Button>
      </div>

      <Tabs defaultValue="detail" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="detail">Détails</TabsTrigger>
          <TabsTrigger value="group">Groupes</TabsTrigger>
          <TabsTrigger value="deliverables">Livrables</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="presentations">Soutenances</TabsTrigger>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
          <StudentProjectDetailTab projectId={id} />
        </TabsContent>

        <TabsContent value="group">
          <StudentProjectGroupsTab />
        </TabsContent>

        <TabsContent value="deliverables">
          <StudentProjectDeliverablesTab />
        </TabsContent>

        <TabsContent value="reports">
          <StudentProjectRepportsTab />
        </TabsContent>

        <TabsContent value="presentations">
          <StudentProjectPresentationsTab />
        </TabsContent>

        <TabsContent value="evaluations">
          <StudentProjectEvaluationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProjecTabPage;
