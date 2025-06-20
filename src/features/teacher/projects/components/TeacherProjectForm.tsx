import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateProjectData, UpdateProjectData, ProjectStatus, GroupFormationMethod } from "@/domains/project/models/projectModels";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du projet doit contenir au moins 2 caractères",
  }),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus, {
    required_error: "Veuillez sélectionner un statut",
  }),
  minGroupSize: z.coerce
    .number()
    .int()
    .min(1, {
      message: "La taille minimale doit être d'au moins 1",
    })
    .max(20, {
      message: "La taille minimale ne peut pas dépasser 20",
    }),
  maxGroupSize: z.coerce
    .number()
    .int()
    .min(1, {
      message: "La taille maximale doit être d'au moins 1",
    })
    .max(20, {
      message: "La taille maximale ne peut pas dépasser 20",
    }),
  groupFormationMethod: z.nativeEnum(GroupFormationMethod, {
    required_error: "Veuillez sélectionner une méthode de formation",
  }),
  groupFormationDeadline: z.date().optional(),
  promotionId: z.string().min(1, {
    message: "Veuillez sélectionner une promotion",
  }),
}).refine((data) => data.maxGroupSize >= data.minGroupSize, {
  message: "La taille maximale doit être supérieure ou égale à la taille minimale",
  path: ["maxGroupSize"],
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  projectId?: string;
  loading: boolean;
  error: string | null;
  fetchProjectById?: (id: string) => Promise<any>;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
  isEdit?: boolean;
  promotions?: Array<{ id: string; name: string; year: number }>;
}

const TeacherProjectForm: React.FC<ProjectFormProps> = ({
  projectId,
  loading,
  error,
  fetchProjectById,
  onSubmit,
  isEdit = false,
  promotions = [],
}) => {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    ...(isEdit ? {} : {
      defaultValues: {
        name: "",
        description: "",
        status: ProjectStatus.DRAFT,
        minGroupSize: 1,
        maxGroupSize: 1,
        groupFormationMethod: GroupFormationMethod.MANUAL,
        groupFormationDeadline: undefined,
        promotionId: "",
      }
    })
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!isEdit || !projectId || !fetchProjectById) {
          return;
        }

        const project = await fetchProjectById(projectId);
        if (project) {
          form.reset({
            name: project.name,
            description: project.description || "",
            status: project.status,
            minGroupSize: project.minGroupSize,
            maxGroupSize: project.maxGroupSize,
            groupFormationMethod: project.groupFormationMethod,
            groupFormationDeadline: project.groupFormationDeadline
              ? new Date(project.groupFormationDeadline)
              : undefined,
            promotionId: project.promotionId || "",
          });
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du projet:", err);
        navigate("/teacher/projects");
      }
    };

    fetchProject();
  }, [projectId, fetchProjectById, form, navigate, isEdit]);

  const handleSubmit = async (values: FormValues) => {
    const projectData = {
      name: values.name,
      description: values.description || undefined,
      status: values.status,
      minGroupSize: values.minGroupSize,
      maxGroupSize: values.maxGroupSize,
      groupFormationMethod: values.groupFormationMethod,
      groupFormationDeadline: values.groupFormationDeadline
        ? values.groupFormationDeadline.toISOString()
        : undefined,
      promotionId: values.promotionId,
    };

    await onSubmit(isEdit ? { ...projectData, id: projectId } : projectData);
  };

  const handleBack = () => {
    navigate("/teacher/projects");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {isEdit ? "Modifier le projet" : "Créer un nouveau projet"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Développement d'une application web" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le projet..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Statut du projet</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ProjectStatus.DRAFT} id="draft" />
                          <Label htmlFor="draft">Brouillon</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ProjectStatus.VISIBLE} id="visible" />
                          <Label htmlFor="visible">Visible aux étudiants</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promotionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une promotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {promotions.map((promotion) => (
                          <SelectItem key={promotion.id} value={promotion.id}>
                            {promotion.name} - {promotion.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-7">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2 mt-8">
                Configuration des groupes
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 max-w-xs">
                  <FormField
                    control={form.control}
                    name="minGroupSize"
                    render={({ field }) => (
                      <FormItem >
                        <FormLabel>Taille minimale du groupe</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="text"
                              value={field.value}
                              readOnly
                              className="text-center h-10 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.min(20, field.value + 1))}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxGroupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille maximale du groupe</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="text"
                              value={field.value}
                              readOnly
                              className="text-center h-10 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.min(20, field.value + 1))}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupFormationDeadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date limite de formation de groupe</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="groupFormationMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Méthode de formation des groupes</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={GroupFormationMethod.MANUAL} id="manual" />
                              <Label htmlFor="manual">Manuelle</Label>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              L'enseignant crée et assigne les groupes manuellement
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={GroupFormationMethod.FREE} id="free" />
                              <Label htmlFor="free">Libre</Label>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Les étudiants forment leurs groupes librement
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={GroupFormationMethod.RANDOM} id="random" />
                              <Label htmlFor="random">Aléatoire</Label>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Les groupes sont générés automatiquement et aléatoirement
                            </p>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Annuler
        </Button>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={loading}
        >
          {isEdit ? "Mettre à jour le projet" : "Créer le projet"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeacherProjectForm;
