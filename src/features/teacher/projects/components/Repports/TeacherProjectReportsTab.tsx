import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  FileText, 
  Users, 
  Calendar, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Code,
  Type,
  AlertCircle,
  BookOpen,
  Navigation
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { toast } from 'sonner';

const TeacherProjectReportsTab = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    reports,
    currentReport,
    navigation,
    loading,
    error,
    stats,
    fetchProjectReports,
    fetchReportById,
    fetchReportNavigation,
    fetchNextReport,
    fetchPreviousReport,
    clearError
  } = useReports(projectId);

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const handleReportSelect = async (reportId: string) => {
    try {
      console.log(' === SÉLECTION RAPPORT ===', reportId);
      await fetchReportById(reportId);
      if (projectId) {
        await fetchReportNavigation(projectId, reportId);
      }
      setViewMode('detail');
      setCurrentSectionIndex(0);
    } catch (error) {
      console.error(' Erreur lors de la sélection du rapport:', error);
      toast.error('Erreur lors du chargement du rapport');
    }
  };

  const handleNavigateReport = async (direction: 'prev' | 'next') => {
    if (!currentReport || !projectId) return;
    
    try {
      console.log(` === NAVIGATION ${direction.toUpperCase()} ===`);
      
      if (direction === 'next') {
        await fetchNextReport(projectId, currentReport.id);
      } else {
        await fetchPreviousReport(projectId, currentReport.id);
      }
      
      if (currentReport) {
        await fetchReportNavigation(projectId, currentReport.id);
      }
      setCurrentSectionIndex(0);
    } catch (error) {
      console.error(`Erreur navigation ${direction}:`, error);
    }
  };

  const handleSectionNavigation = (direction: 'prev' | 'next') => {
    if (!currentReport || currentReport.sections.length === 0) return;
    
    const sortedSections = [...currentReport.sections].sort((a, b) => a.order - b.order);
    
    if (direction === 'next' && currentSectionIndex < sortedSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else if (direction === 'prev' && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'html': return <Code className="h-4 w-4" />;
      case 'markdown': return <BookOpen className="h-4 w-4" />;
      case 'plain': return <Type className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  if (!projectId || projectId === 'undefined') {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur: ID du projet invalide ou manquant dans l'URL
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (viewMode === 'detail' && currentReport) {
    const sortedSections = [...currentReport.sections].sort((a, b) => a.order - b.order);
    const currentSection = sortedSections[currentSectionIndex] || null;

    return (
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setViewMode('list');
                setCurrentSectionIndex(0);
              }}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Retour à la liste</span>
            </Button>
            {navigation && (
              <div className="text-sm text-muted-foreground">
                Rapport {navigation.current.index} sur {navigation.current.total}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleNavigateReport('prev')}
              disabled={!navigation?.previous || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Rapport précédent</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleNavigateReport('next')}
              disabled={!navigation?.next || loading}
            >
              <span className="mr-1">Rapport suivant</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{currentReport.title}</CardTitle>
                <CardDescription className="mt-2">
                  Groupe: {currentReport.group.name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {currentReport.sections.length} section(s)
                </Badge>
                <Badge variant={
                  currentReport.status === 'published' ? 'default' :
                  currentReport.status === 'submitted' ? 'secondary' : 'outline'
                }>
                  {currentReport.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {currentReport.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Membres du groupe:</span>
                <ul className="mt-1 space-y-1">
                  {currentReport.group.members.map(member => (
                    <li key={member.id} className="text-muted-foreground">
                      {member.firstName} {member.lastName}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium">Dernière modification:</span>
                <p className="text-muted-foreground mt-1">
                  {new Date(currentReport.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sections du rapport
              </CardTitle>
              
              {sortedSections.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSectionNavigation('prev')}
                    disabled={currentSectionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Section {currentSectionIndex + 1} sur {sortedSections.length}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSectionNavigation('next')}
                    disabled={currentSectionIndex === sortedSections.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sortedSections.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucune section</h3>
                <p className="text-muted-foreground">
                  Ce rapport ne contient aucune section pour le moment.
                </p>
              </div>
            ) : currentSection ? (
              <div className="space-y-4">
                {}
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-lg font-semibold">{currentSection.title}</h3>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getContentTypeIcon(currentSection.contentType)}
                    <span>{currentSection.contentType.toUpperCase()}</span>
                  </Badge>
                </div>
                
                {}
                <div className="prose max-w-none p-4 bg-gray-50 rounded-lg">
                  {currentSection.contentType === 'html' ? (
                    <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {currentSection.content || <span className="text-muted-foreground italic">Aucun contenu</span>}
                    </div>
                  )}
                </div>
                
                {}
                <div className="mt-8 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Toutes les sections:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {sortedSections.map((section, index) => (
                      <Button 
                        key={section.id}
                        variant={index === currentSectionIndex ? "default" : "outline"}
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setCurrentSectionIndex(index)}
                      >
                        <span className="truncate">{index + 1}. {section.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Chargement...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">
            Consultez les rapports soumis par les groupes
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <FileText className="h-4 w-4" />
          {reports.length} rapport(s)
        </Badge>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total rapports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submittedReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedReports}</div>
          </CardContent>
        </Card>
      </div>

      {}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              <span className="sr-only">Fermer</span>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Rapports du projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucun rapport disponible</h3>
              <p className="text-muted-foreground">
                Les rapports apparaîtront ici lorsque les groupes les auront créés.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleReportSelect(report.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Groupe: {report.group.name}
                      </p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {report.sections.length} section(s)
                      </Badge>
                      <Badge variant={
                        report.status === 'published' ? 'default' :
                        report.status === 'submitted' ? 'secondary' : 'outline'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{report.group.members.length} membre(s)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Modifié le {new Date(report.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportSelect(report.id);
                      }}
                      disabled={loading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProjectReportsTab;