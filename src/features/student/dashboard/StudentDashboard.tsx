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
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { useStudentProjects } from '../projects/hooks/useStudentProjects';
import { useStudentPromotion } from '../promotions/hooks/useStudentPromotion';

const StudentDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchMyProjects,
    getUpcomingDeadlines,
    getProjectStats
  } = useStudentProjects();

  const {
    promotion,
    loading: promotionLoading,
    error: promotionError,
    fetchMyPromotion
  } = useStudentPromotion();

  const currentUser = promotion?.students?.find(student => {
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      return student.email === localUser.email || student.id === localUser.id;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMyProjects();
    fetchMyPromotion();
  }, [fetchMyProjects, fetchMyPromotion]);

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Moins d\'1h';
  };

  const getUrgencyColor = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    if (hours < 24) return 'text-red-600 bg-red-50 border-red-200';
    if (hours < 72) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const calculateProjectProgress = (project: any) => {
    if (!project.deliverables || project.deliverables.length === 0) return 0;

    const submittedCount = project.deliverables.filter((d: any) =>
      d.submissions && d.submissions.length > 0
    ).length;

    return Math.round((submittedCount / project.deliverables.length) * 100);
  };

  const stats = getProjectStats();
  const upcomingDeadlines = getUpcomingDeadlines().slice(0, 5);

  const getAllDeliverables = () => {
    let totalDeliverables = 0;
    let submittedDeliverables = 0;

    projects.forEach(project => {
      if (project.deliverables) {
        totalDeliverables += project.deliverables.length;
        submittedDeliverables += project.deliverables.filter((d: any) =>
          d.submissions && d.submissions.length > 0
        ).length;
      }
    });

    return {
      total: totalDeliverables,
      submitted: submittedDeliverables,
      submissionRate: totalDeliverables > 0 ? Math.round((submittedDeliverables / totalDeliverables) * 100) : 0
    };
  };

  const deliverableStats = getAllDeliverables();

  const handleRefreshData = async () => {
    await Promise.all([
      fetchMyProjects(),
      fetchMyPromotion()
    ]);
  };

  if (projectsLoading || promotionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const userData = {
    firstName: currentUser?.firstName || "Étudiant",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    promotion: promotion?.name || "Formation"
  };

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
                Voici un aperçu de vos projets et activités en cours
              </p>
              <div className="flex items-center gap-4 mt-4">
                {userData.promotion && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-blue-100">{userData.promotion}</span>
                  </div>
                )}
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
      {(projectsError || promotionError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {projectsError || promotionError}
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
            <div className="text-3xl font-bold text-blue-600">{stats.activeProjects}</div>
            <p className="text-xs text-gray-500 mt-1">
              sur {stats.totalProjects} au total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Livrables Soumis</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{deliverableStats.submitted}</div>
            <p className="text-xs text-gray-500 mt-1">
              {deliverableStats.submissionRate}% de réussite
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Échéances à venir</CardTitle>
            <Timer className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.upcomingDeadlinesCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              dans les prochains jours
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Prochaine Échéance</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            {stats.nextDeadline ? (
              <>
                <div className="text-lg font-bold text-purple-600">
                  {formatTimeRemaining(stats.nextDeadline.deliverable.deadline)}
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stats.nextDeadline.deliverable.name}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-green-600">Aucune</div>
                <p className="text-xs text-gray-500 mt-1">Excellent ! 🎉</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale - Projets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projets en cours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Mes Projets en Cours
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun projet disponible</h3>
                  <p className="text-gray-500">Vous n'avez pas encore de projets assignés.</p>
                </div>
              ) : (
                projects.map((project) => {
                  const progress = calculateProjectProgress(project);
                  const deliverableCount = project.deliverables?.length || 0;
                  const submittedCount = project.deliverables?.filter((d: any) =>
                    d.submissions && d.submissions.length > 0
                  ).length || 0;

                  return (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          <p className="text-sm text-gray-500">
                            {deliverableCount} livrables •
                            {submittedCount} soumis
                          </p>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={progress === 100 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}
                        >
                          {progress}% terminé
                        </Badge>
                      </div>

                      <Progress value={progress} className="mb-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">

                          <Badge variant="secondary" className="text-xs">
                            {project.status === 'visible' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Message d'encouragement si pas de projets */}
          {projects.length === 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Prêt pour de nouveaux défis !</h3>
                <p className="text-blue-600 text-sm">
                  Vos projets apparaîtront ici dès qu'ils seront assignés par vos enseignants.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Prochaines échéances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Prochaines Échéances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item, index) => (
                  <div
                    key={`${item.projectId}-${item.deliverable.id}`}
                    className={`p-3 rounded-lg border ${getUrgencyColor(item.deliverable.deadline)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.deliverable.name}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                          {item.projectName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {item.deliverable.type === 'git' ? (
                          <GitBranch className="h-3 w-3" />
                        ) : (
                          <Package className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeRemaining(item.deliverable.deadline)}</span>
                      </div>
                      <span className="text-xs">
                        {item.deliverable.deadline.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Aucune échéance urgente</p>
                  <p className="text-xs text-gray-500">Excellent travail ! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations de la promotion */}
          {promotion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ma Promotion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{promotion.name}</h3>
                  {promotion.description && (
                    <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
                  )}
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-blue-600">{promotion.students?.length || 0}</span>
                    <p className="text-xs text-gray-500">étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citation motivante */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <blockquote className="text-sm text-indigo-800 italic mb-2">
                "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme."
              </blockquote>
              <p className="text-xs text-indigo-600">— Winston Churchill</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
