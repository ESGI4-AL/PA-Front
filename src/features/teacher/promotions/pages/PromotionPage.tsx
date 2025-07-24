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
  Slash,
  Edit,
  Trash,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCcw,
  Search,
} from 'lucide-react';

import { getPromotions, deletePromotion } from '@/domains/promotion/services/promotionService';
import { Promotion } from '@/domains/promotion/models/promotionModels';

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<{ id: string, name: string } | null>(null);

  const navigate = useNavigate();

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPromotions({
        search: searchTerm,
        page: currentPage,
      });
      setPromotions(data.promotions);
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
      fetchPromotions();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage]);

  const handleDeleteRequest = (id: string, name: string) => {
    setPromotionToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promotionToDelete) return;

    const { id, name } = promotionToDelete;
    setLoading(true);

    try {
      await deletePromotion(id);
      setPromotions(prev => prev.filter(promotion => promotion.id !== id));
      toast.success('Promotion supprimée', {
        description: `La promotion "${name}" a été supprimée avec succès.`,
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
      setPromotionToDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/teacher/promotions/${id}/edit`);
  };

  const handleRefresh = () => {
    fetchPromotions();
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
              <BreadcrumbLink href="/teacher/promotions">Promotions</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Link to="/teacher/promotions/create">Ajouter une promotion</Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 w-full">
        <div className="flex-shrink-0 relative">
          <input
            type="text"
            placeholder="Rechercher une promotion"
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
      ) : promotions.length === 0 ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-gray-600">Aucune promotion disponible.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <div className="flex items-center">
                  Nom
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell className="font-medium">{promotion.name}</TableCell>
                <TableCell>{promotion.year}</TableCell>
                <TableCell>
                  {promotion.description
                    ? promotion.description.length > 50
                      ? `${promotion.description.substring(0, 50)}...`
                      : promotion.description
                    : "—"}
                </TableCell>
                <TableCell>
                  {new Date(promotion.createdAt).toLocaleDateString('fr-FR')}
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
                      <DropdownMenuItem onClick={() => handleEdit(promotion.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRequest(promotion.id, promotion.name)}
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
              Êtes-vous sûr de vouloir supprimer la promotion "{promotionToDelete?.name}" ?
              Cette action est irréversible.
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

export default PromotionsPage;
