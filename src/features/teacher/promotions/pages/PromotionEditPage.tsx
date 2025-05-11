import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { usePromotions } from "../hooks/usePromotions";
import { toast } from "sonner";
import { Student, StudentFilters, UpdatePromotionRequest } from "@/domains/promotion/models/promotionModels";

import PromotionForm from "../components/PromotionForm";
import StudentsList from "../components/StudentsList";


const PromotionEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [promotionName, setPromotionName] = useState("");

  const {
    fetchPromotionById,
    editPromotion,
    loading,
    error,
    fetchStudents,
    addStudent,
    removeStudent,
    importStudents,
    updateStudent
  } = usePromotions();

  const getStudentsData = async () => {
    if (!id) return;

    setLoadingStudents(true);
    try {
      const filters: StudentFilters = { isActive: true };
      const studentsArray = await fetchStudents(id, filters);
      setStudents(studentsArray);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Erreur lors du chargement des étudiants");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        if (!id) {
          toast.error("ID de promotion invalide");
          navigate("/teacher/promotions");
          return;
        }

        const promotion = await fetchPromotionById(id);
        if (promotion) {
          setPromotionName(promotion.name);
        } else {
          toast.error("Promotion non trouvée");
          navigate("/teacher/promotions");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la promotion:", err);
        toast.error("Erreur lors du chargement de la promotion");
        navigate("/teacher/promotions");
      }
    };

    fetchPromotion();
  }, [id, fetchPromotionById, navigate]);

  useEffect(() => {
    if (activeTab === "students" && id) {
      getStudentsData();
    }
  }, [activeTab, id]);

  const handleUpdatePromotion = async (promotionData: UpdatePromotionRequest) => {
    if (!id) {
      toast.error("ID de promotion manquant");
      return;
    }

    try {
      await editPromotion(id, promotionData);
      toast.success("Promotion mise à jour avec succès", {
        duration: 5000,
      });
      if (promotionData.name !== promotionName) {
        setPromotionName(promotionData.name || "");
      }
    } catch (err) {
      toast.error(error || "Erreur lors de la mise à jour de la promotion", {
        duration: 5000,
      });
      console.error("Error updating promotion:", err);
    }
  };

  const handleAddStudent = async (studentData: { firstName: string; lastName: string; email: string }) => {
    if (!id) return false;

    try {
      const newStudent = await addStudent(id, studentData);
      setStudents(prev => [...prev, newStudent]);
      toast.success("Étudiant ajouté avec succès");
      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'étudiant:", err);
      toast.error("Erreur lors de l'ajout de l'étudiant");
      return false;
    }
  };

  const handleUpdateStudent = async (studentId: string, studentData: { firstName: string; lastName: string; email: string }) => {
    if (!id) return false;

    try {
      const updatedStudent = await updateStudent(id, studentId, studentData);
      setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
      toast.success("Étudiant modifié avec succès");
      return true;
    } catch (err) {
      console.error("Erreur lors de la modification de l'étudiant:", err);
      toast.error("Erreur lors de la modification de l'étudiant");
      return false;
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!id) return false;

    try {
      await removeStudent(id, studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast.success("Étudiant supprimé avec succès");
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de l'étudiant:", err);
      toast.error("Erreur lors de la suppression de l'étudiant");
      return false;
    }
  };

  const handleImportStudents = async (file: File) => {
    if (!id) return false;

    try {
      await importStudents(id, file);
      await getStudentsData();
      toast.success("Étudiants importés avec succès");
      return true;
    } catch (err) {
      console.error("Erreur lors de l'importation des étudiants:", err);
      toast.error("Erreur lors de l'importation des étudiants");
      return false;
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
              <BreadcrumbLink href="/teacher/promotions">Promotions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>Modifier</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate("/teacher/promotions")}>
          Retour
        </Button>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Détails de la promotion</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <PromotionForm
            promotionId={id}
            loading={loading}
            error={error}
            fetchPromotionById={fetchPromotionById}
            onSubmit={handleUpdatePromotion}
          />
        </TabsContent>

        <TabsContent value="students">
          <StudentsList
            students={students}
            loading={loadingStudents}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onImportStudents={handleImportStudents}
            promotionName={promotionName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromotionEditPage;
