"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplateStore } from "@/stores/template-store";
import {
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  ChevronDown,
  Database,
  BookOpen,
  FileSpreadsheet,
  Smartphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SAMPLE_MEAN_TEMPLATE } from "@/lib/sample-template";

export function ProjectManager() {
  const {
    templates,
    activeTemplateId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    importTemplate,
    exportTemplate,
    exportForDatabase,
    exportCompleteExample,
    setActiveTemplate,
    exportForRealApp,
  } = useTemplateStore();

  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [editTemplateDialog, setEditTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    version: "1.0",
    description: "",
  });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!newTemplateDialog && !editTemplateDialog) {
      setTemplateForm({
        name: "",
        version: "1.0",
        description: "",
      });
    }
  }, [newTemplateDialog, editTemplateDialog]);

  // Load template data when editing
  useEffect(() => {
    if (editTemplateDialog && activeTemplateId) {
      const template = templates.find((t) => t.id === activeTemplateId);
      if (template) {
        setTemplateForm({
          name: template.name,
          version: template.version,
          description: template.description || "",
        });
      }
    }
  }, [editTemplateDialog, activeTemplateId, templates]);

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.version) {
      toast.error("Le nom et la version sont requis");
      return;
    }

    createTemplate(
      templateForm.name,
      templateForm.version,
      templateForm.description
    );
    setNewTemplateDialog(false);
    setTemplateForm({ name: "", version: "1.0", description: "" });
    toast.success("Template créé avec succès");
  };

  const handleUpdateTemplate = () => {
    if (!templateForm.name || !templateForm.version) {
      toast.error("Le nom et la version sont requis");
      return;
    }

    if (activeTemplateId) {
      updateTemplate(activeTemplateId, {
        name: templateForm.name,
        version: templateForm.version,
        description: templateForm.description,
      });
      setEditTemplateDialog(false);
      setTemplateForm({ name: "", version: "1.0", description: "" });
      toast.success("Template mis à jour avec succès");
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      toast.success("Template supprimé avec succès");
      setTemplateToDelete(null);
      setDeleteConfirmDialog(false);
    }
  };

  const handleExportTemplate = (templateId: string) => {
    const templateData = exportTemplate(templateId);
    if (!templateData) {
      toast.error("Erreur lors de l'export du template");
      return;
    }

    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_${templateData.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_v${templateData.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template exporté avec succès");
  };

  const handleExportDatabaseFormat = (templateId: string) => {
    const dbExport = exportForDatabase(templateId);
    if (!dbExport) {
      toast.error("Erreur lors de l'export pour la base de données");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const filename = `db_export_${template?.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_v${template?.version}.json`;

    const blob = new Blob([JSON.stringify(dbExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Export pour base de données créé avec succès");
  };

  const handleExportCompleteExample = (templateId: string) => {
    const completeExport = exportCompleteExample(templateId, true);
    if (!completeExport) {
      toast.error("Erreur lors de l'export de l'exemple complet");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const filename = `complete_example_${template?.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_v${template?.version}.json`;

    const blob = new Blob([JSON.stringify(completeExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exemple complet exporté avec succès");
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const templateId = importTemplate(data);
        setActiveTemplate(templateId);

        // Remove manual tab creation - let GraphToolbar handle it via loadTabsFromTemplate
        toast.success(
          `Template importé avec succès${
            data.metrics ? ` avec ${data.metrics.length} métriques` : ""
          }`
        );
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Format JSON invalide. Vérifiez votre fichier d'import.");
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const handleLoadSampleTemplate = () => {
    try {
      const templateId = importTemplate(SAMPLE_MEAN_TEMPLATE);
      setActiveTemplate(templateId);

      // Remove manual tab creation - let GraphToolbar handle it via loadTabsFromTemplate
      toast.success(`Template d'exemple chargé avec succès !`);
    } catch (error) {
      console.error("Error loading sample:", error);
      toast.error("Erreur lors du chargement du template d'exemple");
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);

    // Remove manual tab creation - let GraphToolbar handle it via loadTabsFromTemplate
    const template = templates.find((t) => t.id === templateId);
    if (template && template.metrics && template.metrics.length > 0) {
      toast.success(
        `Template sélectionné avec ${template.metrics.length} métriques chargées`
      );
    }
  };

  const handleExportForRealApp = (templateId: string) => {
    const appIntegration = exportForRealApp(templateId);
    if (!appIntegration) {
      toast.error("Erreur lors de l'export pour l'application réelle");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const filename = `app_integration_${template?.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_v${template?.version}.json`;

    const blob = new Blob([JSON.stringify(appIntegration, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(
      "Export pour application réelle créé avec succès! Inclut: schéma DB, définitions de formulaires et données d'exemple."
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setNewTemplateDialog(true)}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouveau template
          </Button>
          <label className="flex-shrink-0">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Importer
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
          </label>
          <Button
            variant="outline"
            onClick={handleLoadSampleTemplate}
            className="flex-shrink-0"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Charger l&apos;exemple
          </Button>
          {/* {activeTemplateId && (
            <Button
              variant="outline"
              onClick={() => handleSaveCurrentTabToTemplate()}
              className="flex-shrink-0"
            >
              <Save className="h-4 w-4 mr-1" />
              Sauvegarder l&apos;onglet
            </Button>
          )} */}
        </div>

        <div className="border rounded-lg">
          <ScrollArea className="h-60">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucun template. Créez-en un nouveau ou importez-en un.
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      activeTemplateId === template.id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                    onMouseEnter={(e) => {
                      if (activeTemplateId !== template.id) {
                        e.currentTarget.classList.add("bg-muted");
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTemplateId !== template.id) {
                        e.currentTarget.classList.remove("bg-muted");
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Version {template.version} • {template.metrics.length}{" "}
                        métriques
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 transition-all duration-200 hover:!bg-primary/20 hover:!text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTemplateDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Export Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 transition-all duration-200 hover:!bg-primary/20 hover:!text-primary flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4" />
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportTemplate(template.id);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export template (Graph Builder)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportDatabaseFormat(template.id);
                            }}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Export base de données
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportCompleteExample(template.id);
                            }}
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export avec exemples
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportForRealApp(template.id);
                            }}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Export pour app réelle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="h-8 w-8 p-0"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* New Template Dialog */}
      <Dialog open={newTemplateDialog} onOpenChange={setNewTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau template</DialogTitle>
            <DialogDescription>
              Remplissez les informations du template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="ex: Carte d'évaluation standard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={templateForm.version}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    version: e.target.value,
                  }))
                }
                placeholder="ex: 1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description du template..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewTemplateDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateTemplate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialog} onOpenChange={setEditTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
            <DialogDescription>
              Modifiez les informations du template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du template</Label>
              <Input
                id="edit-name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={templateForm.version}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    version: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Description (optionnelle)
              </Label>
              <Textarea
                id="edit-description"
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTemplateDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateTemplate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmDialog}
        onOpenChange={setDeleteConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le template</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce template ? Cette action est
              irréversible et supprimera toutes les métriques associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmDialog(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
