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
import { UpdatePromotionRequest } from "@/domains/promotion/models/promotionModels";
import { useNavigate } from "react-router-dom";

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

type FormValues = z.infer<typeof formSchema>;

interface PromotionFormProps {
  promotionId?: string;
  loading: boolean;
  error: string | null;
  fetchPromotionById: (id: string) => Promise<any>;
  onSubmit: (data: UpdatePromotionRequest) => Promise<void>;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  promotionId,
  loading,
  error,
  fetchPromotionById,
  onSubmit,
}) => {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      description: "",
    },
  });

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        if (!promotionId) {
          navigate("/teacher/promotions");
          return;
        }

        const promotion = await fetchPromotionById(promotionId);
        if (promotion) {
          form.reset({
            name: promotion.name,
            year: promotion.year,
            description: promotion.description || "",
          });
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des promotions:", err);
        navigate("/teacher/promotions");
      }
    };

    fetchPromotion();
  }, [promotionId, fetchPromotionById, form, navigate]);

  const handleSubmit = async (values: FormValues) => {
    const promotionData: UpdatePromotionRequest = {
      name: values.name,
      year: values.year,
      description: values.description || undefined,
    };

    await onSubmit(promotionData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Modifier la promotion</CardTitle>
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
      <CardFooter className="flex justify-end">
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={loading}
        >
          Mettre à jour la promotion
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionForm;
