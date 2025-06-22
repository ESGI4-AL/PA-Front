import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/components/ui/pagination";
import {
  Badge
} from "@/shared/components/ui/badge";

import {
  Slash,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Eye,
  Users,
  Calendar,
} from 'lucide-react';

import { ProjectStatus } from '@/domains/project/models/projectModels';
import { useStudentProjects } from '../hooks/useStudentProjects';

const StudentProjectsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const {
    projects,
    loading,
    error,
    totalPages,
    fetchMyProjects,
    clearError
  } = useStudentProjects();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMyProjects({
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, fetchMyProjects]);

  const handleFetchProjects = async () => {
    try {
      await fetchMyProjects({
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
      clearError();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      toast.error('Erreur de chargement', {
        description: errorMessage,
        duration: 5000
      });
    }
  };

  const handleRefresh = () => {
    handleFetchProjects();
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      [ProjectStatus.DRAFT]: { label: 'Brouillon', variant: 'secondary' as const },
      [ProjectStatus.VISIBLE]: { label: 'Actif', variant: 'default' as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleViewProject = (id: string) => {
    navigate(`/student/projects/${id}/detail`);
  };

  const formatGroupSize = (project: any) => {
    if (project.minGroupSize === project.maxGroupSize) {
      return `${project.minGroupSize}`;
    }
    return `${project.minGroupSize}-${project.maxGroupSize}`;
  };

  const formatTeacherName = (teacher?: any) => {
    if (!teacher) return '—';
    return `${teacher.firstName} ${teacher.lastName}`;
  };

  const getUpcomingDeadline = (project: any) => {
    if (!project.deliverables || project.deliverables.length === 0) {
      return null;
    }

    const now = new Date();
    const upcomingDeliverables = project.deliverables
      .filter((d: any) => new Date(d.deadline) > now)
      .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return upcomingDeliverables.length > 0 ? upcomingDeliverables[0] : null;
  };

  return (
    <div className="container mx-auto pb-6">
      <div className="flex justify-between items-center mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student/projects">Mes Projets</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 w-full">
        <div className="flex-shrink-0 relative">
          <input
            type="text"
            placeholder="Rechercher un projet"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-96 pl-10 pr-4 py-2 border border-input rounded-md shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
        </div>
        <div className="ml-auto">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem className="px-4 flex items-center">
                Page {currentPage} sur {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p>{error}</p>
          <Button variant="outline" className="mt-2" onClick={handleRefresh}>
            Réessayer
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-gray-600">
            {searchTerm
              ? "Aucun projet ne correspond à votre recherche."
              : "Vous n'êtes inscrit à aucun projet pour le moment."
            }
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center">
                  Projet
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Enseignant</TableHead>
              <TableHead>Promotion</TableHead>
              <TableHead>Groupes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Taille groupes</TableHead>
              <TableHead>Prochaine échéance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const upcomingDeadline = getUpcomingDeadline(project);
              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {project.description.length > 60
                            ? `${project.description.substring(0, 60)}...`
                            : project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatTeacherName(project.teacher)}</div>
                      {project.teacher?.email && (
                        <div className="text-muted-foreground text-xs">{project.teacher.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.promotion ? (
                      <div className="text-sm">
                        <div className="font-medium">{project.promotion.name}</div>
                        <div className="text-muted-foreground">{project.promotion.year}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{project.myGroup.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell>
                    {formatGroupSize(project)} étudiant{project.maxGroupSize > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    {upcomingDeadline ? (
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {upcomingDeadline.name}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(upcomingDeadline.deadline).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir le projet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default StudentProjectsListPage;
