"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import {
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Save,
  ChevronDown,
  Database,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    addMetricToTemplate,
  } = useTemplateStore();

  const { getActiveTab, createTab, importGraph } =
    useMultiTabGraphBuilderStore();

  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [editTemplateDialog, setEditTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    version: "1.0",
    description: "",
  });

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
      alert("Le nom et la version sont requis");
      return;
    }

    createTemplate(
      templateForm.name,
      templateForm.version,
      templateForm.description
    );
    setNewTemplateDialog(false);
  };

  const handleUpdateTemplate = () => {
    if (!activeTemplateId || !templateForm.name || !templateForm.version) {
      alert("Le nom et la version sont requis");
      return;
    }

    updateTemplate(activeTemplateId, {
      name: templateForm.name,
      version: templateForm.version,
      description: templateForm.description,
    });
    setEditTemplateDialog(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce template?")) {
      deleteTemplate(templateId);
    }
  };

  const handleExportTemplate = (templateId: string) => {
    const template = exportTemplate(templateId);
    if (!template) return;

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `${template.name}_v${template.version}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleExportDatabaseFormat = (templateId: string) => {
    const dbExport = exportForDatabase(templateId);
    if (!dbExport) {
      alert("Erreur lors de l'export pour la base de données");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const filename = `${template?.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_database_v${template?.version}.json`;

    const dataStr = JSON.stringify(dbExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
  };

  const handleExportCompleteExample = (templateId: string) => {
    const completeExport = exportCompleteExample(templateId, true);
    if (!completeExport) {
      alert("Erreur lors de l'export de l'exemple complet");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const filename = `${template?.name
      .toLowerCase()
      .replace(/\s+/g, "_")}_complete_example_v${template?.version}.json`;

    const dataStr = JSON.stringify(completeExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const templateData = JSON.parse(e.target?.result as string);
        importTemplate(templateData);
        alert("Template importé avec succès");
      } catch {
        alert("Format JSON invalide. Vérifiez votre fichier d'import.");
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const handleLoadSampleTemplate = () => {
    try {
      // Import the sample template
      const templateId = importTemplate(SAMPLE_MEAN_TEMPLATE);
      setActiveTemplate(templateId);

      // Load the metrics into tabs
      SAMPLE_MEAN_TEMPLATE.metrics.forEach((metric) => {
        const tabId = createTab(metric.name);
        importGraph(tabId, {
          nodes: metric.nodes || [],
          connections: metric.connections || [],
          position: metric.position || { x: 0, y: 0, zoom: 1 },
        });
      });

      alert("Template d'exemple chargé avec succès!");
    } catch (error) {
      console.error("Erreur lors du chargement du template d'exemple:", error);
      alert("Erreur lors du chargement du template d'exemple");
    }
  };

  const handleSaveCurrentTabToTemplate = () => {
    if (!activeTemplateId) {
      alert("Veuillez d'abord sélectionner ou créer un template");
      return;
    }

    const activeTab = getActiveTab();
    if (!activeTab) {
      alert("Aucun onglet actif");
      return;
    }

    // Add the current tab to the active template
    addMetricToTemplate(activeTemplateId, activeTab);
    alert("Métrique sauvegardée dans le template");
  };

  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des templates</CardTitle>
          <CardDescription>
            Créez, modifiez et exportez vos templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
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
            {activeTemplateId && (
              <Button
                variant="outline"
                onClick={() => handleSaveCurrentTabToTemplate()}
                className="flex-shrink-0"
              >
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder l&apos;onglet
              </Button>
            )}
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
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${
                        activeTemplateId === template.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectTemplate(template.id)}
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
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                              <ChevronDown className="h-3 w-3 ml-1" />
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
                              <Database className="h-4 w-4 mr-2" />
                              Export avec exemples
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
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
        </CardContent>
      </Card>

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
    </div>
  );
}
