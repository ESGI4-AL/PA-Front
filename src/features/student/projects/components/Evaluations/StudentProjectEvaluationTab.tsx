import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calculator, 
  Star, 
  Eye,
  EyeOff,
  Award,
  BookOpen,
  Presentation,
  Users,
  AlertCircle,
  Clock,
  MessageCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useStudentEvaluations } from '../../hooks/useStudentEvaluations';

interface EvaluationCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  type: 'group' | 'individual';
  evaluationType: 'deliverable' | 'report' | 'presentation';
}

interface Grade {
  id: string;
  score: number;
  comment?: string;
  isPublished: boolean;
  criteriaId: string;
  groupId?: string;
  studentId?: string;
  criteria: EvaluationCriteria;
  group?: any;
  student?: any;
}

interface StudentGradeData {
  deliverable: {
    group: Grade[];
    individual: Grade[];
  };
  report: {
    group: Grade[];
    individual: Grade[];
  };
  presentation: {
    group: Grade[];
    individual: Grade[];
  };
}

const StudentProjectEvaluationTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    loading,
    error,
    grades,
    studentInfo,
    projectInfo,
    refreshGrades,
    getStatistics
  } = useStudentEvaluations(projectId || '');

  const getEvaluationTypeIcon = (type: string) => {
    switch (type) {
      case 'deliverable': return <BookOpen className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'presentation': return <Presentation className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case 'deliverable': return 'Livrable';
      case 'report': return 'Rapport';
      case 'presentation': return 'Soutenance';
      default: return type;
    }
  };

  const calculateWeightedAverage = (gradesList: Grade[]) => {
    if (gradesList.length === 0) return null;
    
    const publishedGrades = gradesList.filter(g => g.isPublished);
    if (publishedGrades.length === 0) return null;
    
    const totalWeight = publishedGrades.reduce((sum, grade) => sum + grade.criteria.weight, 0);
    const weightedSum = publishedGrades.reduce((sum, grade) => sum + (grade.score * grade.criteria.weight), 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  };

  const calculateOverallAverage = () => {
    const allGrades = [
      ...grades.deliverable.group,
      ...grades.deliverable.individual,
      ...grades.report.group,
      ...grades.report.individual,
      ...grades.presentation.group,
      ...grades.presentation.individual
    ];
    
    return calculateWeightedAverage(allGrades);
  };

  const getGradeBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 16) return 'default';
    if (score >= 14) return 'secondary';
    if (score >= 12) return 'outline';
    return 'destructive';
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

  if (loading && (!grades.deliverable.group.length && !grades.deliverable.individual.length)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const overallAverage = calculateOverallAverage();
  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mes évaluations</h2>
        <p className="text-muted-foreground">
          Consultez vos notes et commentaires pour le projet
        </p>
      </div>
      
      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Notes et évaluations
            {overallAverage !== null && (
              <Badge variant="secondary" className="ml-auto text-lg px-3 py-1">
                Moyenne: {overallAverage.toFixed(1)}/20
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {}
          {studentInfo && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {studentInfo?.firstName?.[0]}{studentInfo?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {studentInfo?.firstName} {studentInfo?.lastName}
                    </span>
                    <span className="text-sm text-gray-600">{studentInfo?.email}</span>
                  </div>
                  {studentInfo?.group && (
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span className="text-sm text-gray-600">{studentInfo.group.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {studentInfo.group.members.length} membre{studentInfo.group.members.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {['deliverable', 'report', 'presentation'].map((type) => {
              const typeGrades = [...grades[type as keyof StudentGradeData].group, ...grades[type as keyof StudentGradeData].individual];
              const publishedGrades = typeGrades.filter(g => g.isPublished);
              const average = calculateWeightedAverage(typeGrades);
              
              return (
                <div key={type} className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getEvaluationTypeIcon(type)}
                    <span className="text-sm font-medium">{getEvaluationTypeLabel(type)}</span>
                  </div>
                  <div className="text-xl font-bold">
                    {average !== null ? `${average.toFixed(1)}/20` : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {publishedGrades.length}/{typeGrades.length} note{typeGrades.length > 1 ? 's' : ''} publiée{typeGrades.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Progression</span>
              </div>
              <div className="text-xl font-bold">{stats.completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Évaluations terminées</div>
            </div>
          </div>

          {}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {}
          <Tabs defaultValue="deliverable" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deliverable" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Livrables
              </TabsTrigger>
              <TabsTrigger value="report" className="gap-2">
                <FileText className="h-4 w-4" />
                Rapports
              </TabsTrigger>
              <TabsTrigger value="presentation" className="gap-2">
                <Presentation className="h-4 w-4" />
                Soutenances
              </TabsTrigger>
            </TabsList>

            {['deliverable', 'report', 'presentation'].map((evaluationType) => (
              <TabsContent key={evaluationType} value={evaluationType} className="mt-6">
                <div className="space-y-4">
                  {}
                  {grades[evaluationType as keyof StudentGradeData].group.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Évaluation de groupe
                      </h4>
                      
                      {grades[evaluationType as keyof StudentGradeData].group.map((grade) => (
                        <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-medium">{grade.criteria.name}</h5>
                              {grade.criteria.description && (
                                <p className="text-sm text-muted-foreground">{grade.criteria.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                Coeff: {grade.criteria.weight}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Groupe
                              </Badge>
                              {grade.isPublished ? (
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-green-600" />
                                  <Badge variant={getGradeBadgeVariant(grade.score)} className="text-base px-2 py-1">
                                    {grade.score}/20
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                  <Badge variant="outline" className="text-sm">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En attente
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {grade.isPublished && grade.comment && (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Commentaire de l'enseignant</p>
                                  <p className="text-sm text-gray-700">{grade.comment}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {}
                  {grades[evaluationType as keyof StudentGradeData].individual.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Évaluation individuelle
                      </h4>
                      
                      {grades[evaluationType as keyof StudentGradeData].individual.map((grade) => (
                        <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-medium">{grade.criteria.name}</h5>
                              {grade.criteria.description && (
                                <p className="text-sm text-muted-foreground">{grade.criteria.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                Coeff: {grade.criteria.weight}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Individuel
                              </Badge>
                              {grade.isPublished ? (
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-green-600" />
                                  <Badge variant={getGradeBadgeVariant(grade.score)} className="text-base px-2 py-1">
                                    {grade.score}/20
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                  <Badge variant="outline" className="text-sm">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En attente
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {grade.isPublished && grade.comment && (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Commentaire de l'enseignant</p>
                                  <p className="text-sm text-gray-700">{grade.comment}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {}
                  {grades[evaluationType as keyof StudentGradeData].group.length === 0 && 
                   grades[evaluationType as keyof StudentGradeData].individual.length === 0 && (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Aucune évaluation</h3>
                      <p className="text-muted-foreground">
                        Aucun critère d'évaluation n'a encore été défini pour {getEvaluationTypeLabel(evaluationType).toLowerCase()}.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProjectEvaluationTab;