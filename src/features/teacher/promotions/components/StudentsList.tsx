import React, { useState } from "react";
import { Plus, Search, Upload, Download, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Student } from "@/domains/promotion/models/promotionModels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import AddStudentDialog from "./StudentDialogs/AddStudentDialog";
import EditStudentDialog from "./StudentDialogs/EditStudentDialog";
import DeleteStudentDialog from "./StudentDialogs/DeleteStudentDialog";
import ImportStudentsDialog from "./StudentDialogs/ImportStudentsDialog";
import StudentActions from "./StudentActions";

export interface StudentsListProps {
  students: Student[];
  loading: boolean;
  promotionName: string;
  onAddStudent: (studentData: { firstName: string; lastName: string; email: string }) => Promise<boolean>;
  onUpdateStudent: (studentId: string, studentData: { firstName: string; lastName: string; email: string }) => Promise<boolean>;
  onDeleteStudent: (studentId: string) => Promise<boolean>;
  onImportStudents: (file: File) => Promise<boolean>;
}

const StudentsList: React.FC<StudentsListProps> = ({
  students,
  loading,
  promotionName,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const handleExportStudents = () => {
    if (students.length === 0) {
      return;
    }

    const headers = ["Prénom", "Nom", "Email"];
    const csvContent = [
      headers.join(","),
      ...students.map(student =>
        [student.firstName, student.lastName, student.email].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `etudiants-promotion-${promotionName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Liste des étudiants</CardTitle>
              <CardDescription>
                {students.length} étudiant{students.length !== 1 ? "s" : ""} dans cette promotion
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>

              <Button variant="outline" onClick={handleExportStudents}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>

              <Button onClick={() => setOpenAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun étudiant dans cette promotion</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setOpenAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un étudiant
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <StudentActions
                          student={student}
                          onEdit={() => setStudentToEdit(student)}
                          onDelete={() => setStudentToDelete(student)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAddStudent={onAddStudent}
      />

      {studentToEdit && (
        <EditStudentDialog
          open={!!studentToEdit}
          onOpenChange={(open) => {
            if (!open) setStudentToEdit(null);
          }}
          student={studentToEdit}
          onUpdateStudent={(data) => onUpdateStudent(studentToEdit.id, data)}
        />
      )}

      {studentToDelete && (
        <DeleteStudentDialog
          open={!!studentToDelete}
          onOpenChange={(open) => {
            if (!open) setStudentToDelete(null);
          }}
          student={studentToDelete}
          onDeleteStudent={() => onDeleteStudent(studentToDelete.id)}
        />
      )}

      <ImportStudentsDialog
        open={openImportDialog}
        onOpenChange={setOpenImportDialog}
        onImportStudents={onImportStudents}
      />
    </>
  );
};

export default StudentsList;
