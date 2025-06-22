import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useProjects } from "../hooks/useProjects";
import { toast } from "sonner";
import { UpdateProjectData } from "@/domains/project/models/projectModels";
import { getPromotions } from "@/domains/promotion/services/promotionService";

import TeacherProjectForm from "../components/TeacherProjectForm";
import TeacherProjectGroupsTab from "../components/Groups/TeacherProjectGroupsTab";
import TeacherProjectDeliverablesTab from "../components/Deliverables/TeacherProjectDeliverablesTab";
import TeacherProjectReportTab from "../components/Repports/TeacherProjectReportsTab";
import TeacherProjectPresentationsTab from "../components/Presentations/TeacherProjectPresentationsTab";
import TeacherProjectEvaluationTab from "../components/Evaluations/TeacherProjectEvaluationTab";


const TeacherProjectsTabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");
  const [projectName, setProjectName] = useState("");
  const [promotions, setPromotions] = useState<Array<{ id: string; name: string; year: number }>>([]);

  const {
    fetchProjectById,
    editProject,
    loading,
    error,
  } = useProjects();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromotions();
        setPromotions(data.promotions || []);
      } catch (err) {
        console.error("Erreur lors du chargement des promotions:", err);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          toast.error("ID de projet invalide");
          navigate("/teacher/projects");
          return;
        }

        const project = await fetchProjectById(id);
        if (project) {
          setProjectName(project.name);
        } else {
          toast.error("Projet non trouvé");
          navigate("/teacher/projects");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du projet:", err);
        toast.error("Erreur lors du chargement du projet");
        navigate("/teacher/projects");
      }
    };

    fetchProject();
  }, [id, fetchProjectById, navigate]);

  const handleUpdateProject = async (projectData: UpdateProjectData | any) => {
    if (!id) {
      toast.error("ID de projet manquant");
      return;
    }

    try {
      await editProject(id, projectData);
      toast.success("Projet mis à jour avec succès", {
        duration: 5000,
      });
      if (projectData.name !== projectName) {
        setProjectName(projectData.name || "");
      }
    } catch (err) {
      toast.error(error || "Erreur lors de la mise à jour du projet", {
        duration: 5000,
      });
      console.error("Error updating project:", err);
    }
  };

  return (
    <div className="container mx-auto pb-6">
      <div className="flex justify-between items-center mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/teacher/projects">Projets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>{projectName || "Détails"}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate("/teacher/projects")}>
          Retour
        </Button>
      </div>

      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="edit">Modifier</TabsTrigger>
          <TabsTrigger value="groups">Groupes</TabsTrigger>
          <TabsTrigger value="deliverables">Livrables</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="presentations">Soutenances</TabsTrigger>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <TeacherProjectForm
            projectId={id}
            loading={loading}
            error={error}
            fetchProjectById={fetchProjectById}
            onSubmit={handleUpdateProject}
            isEdit={true}
            promotions={promotions}
          />
        </TabsContent>

        <TabsContent value="groups">
          <TeacherProjectGroupsTab />
        </TabsContent>

        <TabsContent value="deliverables">
          <TeacherProjectDeliverablesTab />
        </TabsContent>

        <TabsContent value="reports">
          <TeacherProjectReportTab />
        </TabsContent>

        <TabsContent value="presentations">
          <TeacherProjectPresentationsTab />
        </TabsContent>

        <TabsContent value="evaluations">
          <TeacherProjectEvaluationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherProjectsTabPage;
