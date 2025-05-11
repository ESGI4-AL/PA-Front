import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportStudents: (file: File) => Promise<boolean>;
}

const ImportStudentsDialog: React.FC<ImportStudentsDialogProps> = ({
  open,
  onOpenChange,
  onImportStudents,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) {
      return;
    }

    const success = await onImportStudents(fileInput.files[0]);
    if (success) {
      if (fileInput) {
        fileInput.value = "";
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des étudiants</DialogTitle>
          <DialogDescription>
            Téléchargez un fichier CSV contenant vos étudiants.
            Le fichier doit contenir les colonnes suivantes : firstName, lastName, email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Fichier CSV</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".csv"
                required
                ref={fileInputRef}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Importer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStudentsDialog;
