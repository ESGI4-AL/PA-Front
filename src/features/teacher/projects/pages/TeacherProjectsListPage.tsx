import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Badge
} from "@/shared/components/ui/badge";

import {
  Slash,
  Trash,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Settings,
} from 'lucide-react';

import { getAllProjects, deleteProject } from '@/domains/project/services/projectService';
import { Project, ProjectStatus } from '@/domains/project/models/projectModels';

const TeacherProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, name: string } | null>(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProjects({
        search: searchTerm,
        page: currentPage,
        limit: 10,
      });
      setProjects(data.projects);
      setTotalPages(data.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      if (!searchTerm) {
        toast.error('Erreur de chargement', {
          description: errorMessage,
          duration: 5000
        });
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProjects();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage]);

  const handleDeleteRequest = (id: string, name: string) => {
    setProjectToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    const { id, name } = projectToDelete;
    setLoading(true);

    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success('Projet supprimé', {
        description: `Le projet "${name}" a été supprimé avec succès.`,
        duration: 5000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression';
      toast.error('Erreur de suppression', {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleManage = (id: string) => {
    navigate(`/teacher/projects/${id}/detail`);
  };

  const handleRefresh = () => {
    fetchProjects();
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      [ProjectStatus.DRAFT]: { label: 'Brouillon', variant: 'secondary' as const },
      [ProjectStatus.VISIBLE]: { label: 'Visible', variant: 'default' as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatGroupSize = (project: Project) => {
    if (project.minGroupSize === project.maxGroupSize) {
      return `${project.minGroupSize}`;
    }
    return `${project.minGroupSize}-${project.maxGroupSize}`;
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
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Link to="/teacher/projects/create">Créer un projet</Link>
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
          <p className="text-gray-600">Aucun projet disponible.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center">
                  Nom
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Promotion</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Taille des groupes</TableHead>
              <TableHead>Formation des groupes</TableHead>
              <TableHead>Date limite</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
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
                  {getStatusBadge(project.status)}
                </TableCell>
                <TableCell>
                  {formatGroupSize(project)} étudiant{project.maxGroupSize > 1 ? 's' : ''}
                </TableCell>
                <TableCell className="capitalize">
                  {project.groupFormationMethod === 'manual' && 'Manuelle'}
                  {project.groupFormationMethod === 'random' && 'Aléatoire'}
                  {project.groupFormationMethod === 'free' && 'Libre'}
                </TableCell>
                <TableCell>
                  {project.groupFormationDeadline
                    ? (() => {
                        console.log('Raw date:', project.groupFormationDeadline);
                        const date = new Date(project.groupFormationDeadline);
                        console.log('Parsed date:', date);
                        console.log('Formatted date:', date.toLocaleDateString('fr-FR'));
                        return date.toLocaleDateString('fr-FR');
                      })()
                    : '—'
                  }
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
                      <DropdownMenuItem onClick={() => handleManage(project.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Gérer le projet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRequest(project.id, project.name)}
                        className="text-red-600 focus:text-red-500"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.name}" ?
              Cette action est irréversible et supprimera également tous les groupes et livrables associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherProjectsListPage;