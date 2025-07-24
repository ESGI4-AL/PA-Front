import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Package,
  GitBranch,
  Timer,
  Trophy,
  Activity,
  Target,
  Bell,
  Star,
  ArrowRight,
  ChevronRight,
  User,
  GraduationCap,
  Briefcase,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Settings,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Calendar as CalendarIcon,
  Brain,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { useProjects } from '../projects/hooks/useProjects';
import { usePromotions } from '../promotions/hooks/usePromotions';
import { useDeliverables } from '../projects/hooks/useDeliverables';
import { useEvaluations } from '../projects/hooks/useEvaluations';
import { useReports } from '../projects/hooks/useReports';

const TeacherDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Hooks pour récupérer les données depuis l'API
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchProjects
  } = useProjects();

  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
    fetchPromotions
  } = usePromotions();

  // Hook conditionnel pour les livrables (seulement si projet sélectionné)
  const {
    deliverables,
    loading: deliverablesLoading,
    stats: deliverableStats
  } = useDeliverables(selectedProjectId || '');

  // Hook conditionnel pour les évaluations
  const {
    criteria,
    loading: evaluationsLoading,
    getStatistics: getEvaluationStats
  } = useEvaluations(selectedProjectId || '');

  // Hook conditionnel pour les rapports
  const {
    reports,
    loading: reportsLoading,
    stats: reportStats
  } = useReports(selectedProjectId ?? undefined);

  // Récupération des informations utilisateur depuis localStorage avec fallback
  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        firstName: user.firstName || "Professeur",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "teacher"
      };
    } catch {
      return {
        firstName: "Professeur",
        lastName: "",
        email: "",
        role: "teacher"
      };
    }
  };

  const userData = getCurrentUser();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Charger les données au montage - utiliser les hooks existants
    fetchProjects();
    fetchPromotions();
  }, [fetchProjects, fetchPromotions]);

  useEffect(() => {
    // Sélectionner automatiquement le premier projet s'il y en a un
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'visible').length;
    const draftProjects = projects.filter(p => p.status === 'draft').length;
    const archivedProjects = 0; // Pas d'état archived dans les types fournis

    return {
      totalProjects,
      activeProjects,
      draftProjects,
      archivedProjects
    };
  };

  const getPromotionStats = () => {
    const totalPromotions = promotions.length;
    // Les étudiants ne sont pas directement dans les promotions selon les types fournis
    // On utilisera les données des hooks dédiés pour les étudiants
    const totalStudents = 0; // À adapter selon l'implémentation réelle
    const averageStudentsPerPromotion = 0; // À adapter selon l'implémentation réelle

    return {
      totalPromotions,
      totalStudents,
      averageStudentsPerPromotion
    };
  };

  const handleRefreshData = async () => {
    await Promise.all([
      fetchProjects(),
      fetchPromotions()
    ]);
  };

  const projectStats = getProjectStats();
  const promotionStats = getPromotionStats();
  const evaluationStats = getEvaluationStats();

  const isLoading = projectsLoading || promotionsLoading || deliverablesLoading || evaluationsLoading || reportsLoading;

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-8 mx-auto p-6">
      {/* Message de bienvenue */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-[#cc8cf7] to-[#fa3747] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getTimeOfDayGreeting()}, {userData.firstName} !
              </h1>
              <p className="text-blue-100 text-lg">
                Gérez vos projets et suivez les progrès de vos étudiants
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-blue-100">Enseignant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-blue-100">
                    {currentTime.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Affichage des erreurs */}
      {(projectsError || promotionsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {projectsError || promotionsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Projets Actifs</CardTitle>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{projectStats.activeProjects}</div>
            <p className="text-xs text-gray-500 mt-1">
              sur {projectStats.totalProjects} au total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promotions</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{promotionStats.totalPromotions}</div>
            <p className="text-xs text-gray-500 mt-1">
              promotions gérées
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Livrables</CardTitle>
            <Package className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{deliverableStats.totalDeliverables}</div>
            <p className="text-xs text-gray-500 mt-1">
              {deliverableStats.activeDeliverables} actifs, {deliverableStats.expiredDeliverables} expirés
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critères d'évaluation</CardTitle>
            <Award className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{evaluationStats.totalCriteria}</div>
            <p className="text-xs text-gray-500 mt-1">
              {evaluationStats.groupCriteria} groupe, {evaluationStats.individualCriteria} individuel
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale - Projets et activités */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mes Projets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Projets
              </CardTitle>

            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun projet créé</h3>
                  <p className="text-gray-500 mb-4">Commencez par créer votre premier projet.</p>

                </div>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedProjectId === project.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{project.name}</h4>
                        <p className="text-sm text-gray-500">
                          {project.promotion?.name || 'Aucune promotion assignée'}
                        </p>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            project.status === 'visible'
                              ? "bg-green-50 text-green-700"
                              : project.status === 'draft'
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-50 text-gray-700"
                          }
                        >
                          {project.status === 'visible' ? 'Actif' :
                           project.status === 'draft' ? 'Brouillon' : 'Archivé'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Créé: {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {project.groupFormationDeadline && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>Groupes: {new Date(project.groupFormationDeadline).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Statistiques du projet sélectionné */}
          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques - {selectedProject.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{deliverableStats.totalDeliverables}</div>
                    <p className="text-xs text-gray-500">Livrables</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reportStats.totalReports}</div>
                    <p className="text-xs text-gray-500">Rapports</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{evaluationStats.totalCriteria}</div>
                    <p className="text-xs text-gray-500">Critères</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(deliverableStats.submissionsRate)}%
                    </div>
                    <p className="text-xs text-gray-500">Soumissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message d'encouragement si pas de projets */}
          {projects.length === 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Prêt à commencer ?</h3>
                <p className="text-blue-600 text-sm mb-4">
                  Créez votre premier projet pour commencer à gérer vos cours et évaluer vos étudiants.
                </p>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Créer mon premier projet
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">

          {/* Citation motivante */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6 text-center">

              <blockquote className="text-sm text-indigo-800 italic mb-2">
                "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde."
              </blockquote>
              <p className="text-xs text-indigo-600">— Nelson Mandela</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
