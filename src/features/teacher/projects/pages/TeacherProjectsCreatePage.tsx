import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slash } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb';
import { useProjects } from "../hooks/useProjects";
import { CreateProjectData, UpdateProjectData } from "@/domains/project/models/projectModels";
import { toast } from "sonner";
import { getPromotions } from "@/domains/promotion/services/promotionService";
import TeacherProjectForm from "../components/TeacherProjectForm";

const TeacherProjectCreatePage: React.FC = () => {
  const { addProject, loading, error } = useProjects();
  const [promotions, setPromotions] = useState<Array<{ id: string; name: string; year: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromotions();
        setPromotions(data.promotions || []);
      } catch (err) {
        console.error("Erreur lors du chargement des promotions:", err);
        toast.error("Erreur lors du chargement des promotions");
      }
    };

    fetchPromotions();
  }, []);

  const handleSubmit = async (projectData: CreateProjectData | UpdateProjectData) => {
    try {
      await addProject(projectData as CreateProjectData);
      toast.success("Projet créé avec succès", {
        duration: 5000,
      });

      navigate("/teacher/projects");
    } catch (err) {
      toast.error(error || "Erreur lors de la création du projet", {
        duration: 5000,
      });
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className="container mx-auto pb-6">
      <div className="flex justify-between items-center mb-10">
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
              <BreadcrumbLink>Créer</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TeacherProjectForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        isEdit={false}
        promotions={promotions}
      />
    </div>
  );
};

export default TeacherProjectCreatePage;