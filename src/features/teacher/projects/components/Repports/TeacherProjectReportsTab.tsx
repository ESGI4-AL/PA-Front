import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { marked } from 'marked';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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
  Navigation,
  Star,
  Save,
  Plus
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useEvaluations } from '../../hooks/useEvaluations';
import { toast } from 'sonner';

interface GradeInput {
  score: number;
  comment?: string;
  isPublished?: boolean;
}

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

  const {
    criteria,
    grades,
    loading: evaluationLoading,
    gradeGroup,
    gradeStudent,
    createEvaluationCriteria
  } = useEvaluations(projectId || '');

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isCreateCriteriaDialogOpen, setIsCreateCriteriaDialogOpen] = useState(false);

  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    weight: 1,
    type: 'group' as 'group' | 'individual',
    evaluationType: 'report' as 'deliverable' | 'report' | 'presentation'
  });

  const [gradeInputs, setGradeInputs] = useState<{[key: string]: GradeInput}>({});

  const handleReportSelect = async (reportId: string) => {
    try {
      console.log('=== SÉLECTION RAPPORT ===', reportId);
      await fetchReportById(reportId);
      if (projectId) {
        await fetchReportNavigation(projectId, reportId);
      }
      setViewMode('detail');
      setCurrentSectionIndex(0);
    } catch (error) {
      console.error('Erreur lors de la sélection du rapport:', error);
      toast.error('Erreur lors du chargement du rapport');
    }
  };

  const handleNavigateReport = async (direction: 'prev' | 'next') => {
    if (!currentReport || !projectId) return;
    
    try {
      console.log(`=== NAVIGATION ${direction.toUpperCase()} ===`);
      
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

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvaluationCriteria(newCriteria);
      setIsCreateCriteriaDialogOpen(false);
      setNewCriteria({
        name: '',
        description: '',
        weight: 1,
        type: 'group',
        evaluationType: 'report'
      });
      toast.success('Critère créé avec succès');
    } catch (error) {
      console.error('Erreur création critère:', error);
      toast.error('Erreur lors de la création du critère');
    }
  };

  const handleGradeSubmit = async (criteriaId: string, groupId: string, studentId?: string) => {
    const gradeKey = `${criteriaId}-${groupId}${studentId ? `-${studentId}` : ''}`;
    const gradeData = gradeInputs[gradeKey];
    
    if (!gradeData || gradeData.score < 0 || gradeData.score > 20) {
      toast.error('Veuillez saisir une note valide (0-20)');
      return;
    }

    try {
      if (studentId) {
        await gradeStudent(criteriaId, studentId, gradeData);
      } else {
        await gradeGroup(criteriaId, groupId, gradeData);
      }
      
      setGradeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[gradeKey];
        return newInputs;
      });
      
      toast.success('Note enregistrée avec succès');
    } catch (error) {
      console.error('Erreur attribution note:', error);
      toast.error('Erreur lors de l\'attribution de la note');
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

  const getReportCriteria = () => {
    return criteria.filter(c => c.evaluationType === 'report');
  };

  const getExistingGrade = (criteriaId: string, groupId: string, studentId?: string) => {
    const evaluationType = 'report';
    const type = studentId ? 'individual' : 'group';
    const targetId = studentId || groupId;
    
    if (grades[evaluationType] && grades[evaluationType][type] && grades[evaluationType][type][targetId]) {
      const gradesForTarget = grades[evaluationType][type][targetId].grades;
      return gradesForTarget.find(g => g.criteriaId === criteriaId);
    }
    return null;
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
        {/* Navigation header */}
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
              onClick={() => setIsGradingDialogOpen(true)}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Noter le rapport
            </Button>
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
                <div className="prose max-w-none p-4 bg-gray-50 rounded-lg" style={{
  // Styles pour les tableaux avec thème corail
  '--table-header-bg': '#ff6b6b',
  '--table-header-color': 'white',
  '--table-border-color': '#ffb3b3',
  '--content-bg': '#fff5f5',
  '--content-color': '#2d3748'
} as React.CSSProperties}>
  <style jsx>{`
    .report-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .report-content th {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%) !important;
      color: white !important;
      border: 1px solid #ff8a80 !important;
      padding: 12px 16px !important;
      font-weight: 600 !important;
      text-align: left !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .report-content td {
      background-color: white !important;
      color: #2d3748 !important;
      border: 1px solid #ffcccc !important;
      padding: 10px 16px !important;
    }
    
    .report-content tr:nth-child(even) td {
      background-color: #fff5f5 !important;
    }
    
    .report-content tr:hover td {
      background-color: #ffebee !important;
    }
    
    .report-content [style*="background-color: #"] {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%) !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
    }
    
    .report-content [style*="background: #"] {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%) !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
    }
    
    .report-content [style*="color: #"] {
      color: #2d3748 !important;
    }
    
    .report-content .blue-section,
    .report-content [class*="blue"],
    .report-content [class*="primary"] {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%) !important;
      color: white !important;
      padding: 16px !important;
      border-radius: 8px !important;
      border: none !important;
    }
    
    .report-content blockquote {
      background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%) !important;
      border-left: 4px solid #ff6b6b !important;
      color: #2d3748 !important;
      padding: 16px 20px !important;
      margin: 16px 0 !important;
      border-radius: 0 8px 8px 0 !important;
      font-style: italic;
    }
    
    .report-content .highlight,
    .report-content [style*="background-color: blue"],
    .report-content [style*="background-color: #4"],
    .report-content [style*="background-color: #5"],
    .report-content [style*="background-color: #6"] {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%) !important;
      color: white !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      font-weight: 500 !important;
    }
    
    .report-content h1, .report-content h2, .report-content h3 {
      color: #ff6b6b !important;
      border-bottom: 2px solid #ffcccc !important;
      padding-bottom: 8px !important;
    }
    
    .report-content .status-badge {
      background: #4ade80 !important;
      color: white !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
    }
    
    .report-content .checkmark {
      color: #4ade80 !important;
      font-weight: bold !important;
    }
  `}</style>
  
  <div className="report-content">
    {currentSection.contentType === 'html' ? (
      <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
    ) : currentSection.contentType === 'markdown' ? (
      <div dangerouslySetInnerHTML={{ __html: marked(currentSection.content) }} />
    ) : (
      <div className="whitespace-pre-wrap">
        {currentSection.content}
      </div>
    )}
  </div>
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
        <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Notation du rapport</DialogTitle>
              <DialogDescription>
                Attribuez les notes selon les critères définis pour les rapports.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {currentReport.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Groupe:</span> {currentReport.group.name}
                    </div>
                    <div>
                      <span className="font-medium">Statut:</span> {currentReport.status}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critères de notation disponibles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Critères de notation</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateCriteriaDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Créer critère
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {getReportCriteria().length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun critère de notation défini pour les rapports.</p>
                      <Button 
                        onClick={() => setIsCreateCriteriaDialogOpen(true)}
                        className="mt-4"
                      >
                        Créer un critère
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getReportCriteria().map((criterion) => (
                        <div key={criterion.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">{criterion.name}</h4>
                              <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  {criterion.type === 'group' ? 'Groupe' : 'Individuel'}
                                </Badge>
                                <Badge variant="secondary">
                                  Poids: {criterion.weight}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Notation */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{currentReport.group.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {currentReport.group.members.length} membre(s)
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {criterion.type === 'group' ? (
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const existingGrade = getExistingGrade(criterion.id, currentReport.group.id);
                                      const gradeKey = `${criterion.id}-${currentReport.group.id}`;
                                      
                                      if (existingGrade) {
                                        return (
                                          <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                              {existingGrade.score}/20
                                            </Badge>
                                            {existingGrade.comment && (
                                              <span className="text-xs text-muted-foreground">
                                                {existingGrade.comment}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            placeholder="Note"
                                            min="0"
                                            max="20"
                                            step="0.5"
                                            className="w-20"
                                            value={gradeInputs[gradeKey]?.score || ''}
                                            onChange={(e) => setGradeInputs(prev => ({
                                              ...prev,
                                              [gradeKey]: {
                                                ...prev[gradeKey],
                                                score: parseFloat(e.target.value) || 0
                                              }
                                            }))}
                                          />
                                          <Input
                                            placeholder="Commentaire"
                                            className="w-40"
                                            value={gradeInputs[gradeKey]?.comment || ''}
                                            onChange={(e) => setGradeInputs(prev => ({
                                              ...prev,
                                              [gradeKey]: {
                                                ...prev[gradeKey],
                                                comment: e.target.value
                                              }
                                            }))}
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleGradeSubmit(criterion.id, currentReport.group.id)}
                                            disabled={evaluationLoading || !gradeInputs[gradeKey]?.score}
                                          >
                                            <Save className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {currentReport.group.members?.map((student: any) => {
                                      const existingGrade = getExistingGrade(criterion.id, currentReport.group.id, student.id);
                                      const gradeKey = `${criterion.id}-${currentReport.group.id}-${student.id}`;
                                      
                                      if (existingGrade) {
                                        return (
                                          <div key={student.id} className="flex items-center gap-2">
                                            <span className="text-sm w-24">{student.firstName} {student.lastName}</span>
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                              {existingGrade.score}/20
                                            </Badge>
                                            {existingGrade.comment && (
                                              <span className="text-xs text-muted-foreground">
                                                {existingGrade.comment}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <div key={student.id} className="flex items-center gap-2">
                                          <span className="text-sm w-24">{student.firstName} {student.lastName}</span>
                                          <Input
                                            type="number"
                                            placeholder="Note"
                                            min="0"
                                            max="20"
                                            step="0.5"
                                            className="w-20"
                                            value={gradeInputs[gradeKey]?.score || ''}
                                            onChange={(e) => setGradeInputs(prev => ({
                                              ...prev,
                                              [gradeKey]: {
                                                ...prev[gradeKey],
                                                score: parseFloat(e.target.value) || 0
                                              }
                                            }))}
                                          />
                                          <Input
                                            placeholder="Commentaire"
                                            className="w-32"
                                            value={gradeInputs[gradeKey]?.comment || ''}
                                            onChange={(e) => setGradeInputs(prev => ({
                                              ...prev,
                                              [gradeKey]: {
                                                ...prev[gradeKey],
                                                comment: e.target.value
                                              }
                                            }))}
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleGradeSubmit(criterion.id, currentReport.group.id, student.id)}
                                            disabled={evaluationLoading || !gradeInputs[gradeKey]?.score}
                                          >
                                            <Save className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      );
                                    }) || (
                                      <p className="text-xs text-muted-foreground">Aucun étudiant dans ce groupe</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsGradingDialogOpen(false)}
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {}
        <Dialog open={isCreateCriteriaDialogOpen} onOpenChange={setIsCreateCriteriaDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un critère de notation</DialogTitle>
              <DialogDescription>
                Définissez un nouveau critère pour évaluer les rapports.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCriteria} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criteriaName">Nom du critère</Label>
                <Input
                  id="criteriaName"
                  placeholder="Qualité de la rédaction"
                  value={newCriteria.name}
                  onChange={(e) => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="criteriaDescription">Description</Label>
                <Textarea
                  id="criteriaDescription"
                  placeholder="Description détaillée du critère..."
                  value={newCriteria.description}
                  onChange={(e) => setNewCriteria(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criteriaWeight">Poids</Label>
                  <Input
                    id="criteriaWeight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newCriteria.weight}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criteriaType">Type</Label>
                  <Select 
                    value={newCriteria.type} 
                    onValueChange={(value: 'group' | 'individual') => 
                      setNewCriteria(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Groupe</SelectItem>
                      <SelectItem value="individual">Individuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateCriteriaDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={evaluationLoading}>
                  Créer le critère
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">
            Consultez les rapports soumis par les groupes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateCriteriaDialogOpen} onOpenChange={setIsCreateCriteriaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                Créer critère
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un critère de notation</DialogTitle>
                <DialogDescription>
                  Définissez un nouveau critère pour évaluer les rapports.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCriteria} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="criteriaName">Nom du critère</Label>
                  <Input
                    id="criteriaName"
                    placeholder="Qualité de la rédaction"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="criteriaDescription">Description</Label>
                  <Textarea
                    id="criteriaDescription"
                    placeholder="Description détaillée du critère..."
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="criteriaWeight">Poids</Label>
                    <Input
                      id="criteriaWeight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={newCriteria.weight}
                      onChange={(e) => setNewCriteria(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criteriaType">Type</Label>
                    <Select 
                      value={newCriteria.type} 
                      onValueChange={(value: 'group' | 'individual') => 
                        setNewCriteria(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Groupe</SelectItem>
                        <SelectItem value="individual">Individuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateCriteriaDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={evaluationLoading}>
                    Créer le critère
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Badge variant="secondary" className="gap-2">
            <FileText className="h-4 w-4" />
            {reports.length} rapport(s)
          </Badge>
        </div>
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
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReportSelect(report.id);
                        }}
                        disabled={loading}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Consulter
                      </Button>
                    </div>
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