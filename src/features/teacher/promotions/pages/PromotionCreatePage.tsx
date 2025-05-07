import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { Loader2, Slash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb';
import { usePromotions } from "../hooks/usePromotions";
import { CreatePromotionRequest } from "@/domains/promotion/models/promotionModels";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de la promotion doit contenir au moins 2 caractères",
  }),
  year: z.coerce
    .number()
    .int()
    .min(2024, {
      message: "L'année doit être supérieure à 2024",
    })
    .max(2100, {
      message: "L'année ne peut pas dépasser 2100",
    }),
  description: z.string().optional(),
});

const PromotionCreatePage: React.FC = () => {
  const { addPromotion, loading, error } = usePromotions();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const promotionData: CreatePromotionRequest = {
        name: values.name,
        year: values.year,
        description: values.description || undefined,
      };

      await addPromotion(promotionData);
      toast.success("Promotion créée avec succès", {
        duration: 5000,
      });

      navigate("/teacher/promotions");

    } catch (err) {
      toast.error(error || "Erreur lors de la création de la promotion", {
        duration: 5000,
      });
      console.error("Error submitting form:", err);
    }
  };

  const handleBack = () => {
    navigate("/teacher/promotions");
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
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>Créer</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer une nouvelle promotion</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la promotion*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 4AL1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                        placeholder="Décrivez cette promotion..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Annuler
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer la promotion"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromotionCreatePage;
