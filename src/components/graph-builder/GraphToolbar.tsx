"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Download,
  Save,
  Trash2,
  Undo,
  Redo,
  LayoutGrid,
  Database,
  RotateCcw,
} from "lucide-react";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CardTemplate } from "@/types/graph-builder";
import { MetricTab } from "@/types/template";
import { ProjectManager } from "./ProjectManager";
import { AutoLayoutControls } from "./AutoLayoutControls";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAutoSave } from "@/hooks/useAutoSave";
import { clearAppStateFromLocalStorage } from "@/lib/localStorage";
import { useTheme } from "next-themes";

export function GraphToolbar({ tabMode = false }: { tabMode?: boolean }) {
  const {
    template,
    setTemplate,
    importGraph: importSingleGraph,
    exportGraph: exportSingleGraph,
    clearGraph,
    nodes,
    undo: singleUndo,
    redo: singleRedo,
    canUndo: singleCanUndo,
    canRedo: singleCanRedo,
  } = useGraphBuilderStore();

  const {
    tabs,
    getActiveTab,
    undo: multiUndo,
    redo: multiRedo,
    canUndo: multiCanUndo,
    canRedo: multiCanRedo,
    isUndoRedoOperation,
    loadTabsFromTemplate,
    createTab,
    importGraph,
    setActiveTab,
  } = useMultiTabGraphBuilderStore();

  const { activeTemplateId, exportForDatabase, setActiveTemplate } =
    useTemplateStore();

  // Initialize auto-save
  useAutoSave(tabMode);

  // Choose the right undo/redo functions based on mode
  const undo = tabMode ? multiUndo : singleUndo;
  const redo = tabMode ? multiRedo : singleRedo;
  const canUndo = tabMode ? multiCanUndo : singleCanUndo;
  const canRedo = tabMode ? multiCanRedo : singleCanRedo;

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<CardTemplate>>({
    code: "",
    metric: "",
    version: 1,
  });

  // When switching templates in tab mode, load the template's tabs
  useEffect(() => {
    if (tabMode && activeTemplateId) {
      // Add a small delay and check if template ID is still the same to prevent rapid successive calls
      const currentTemplateId = activeTemplateId;
      const timeoutId = setTimeout(() => {
        // Double-check that the template ID hasn't changed during the delay
        if (
          useTemplateStore.getState().activeTemplateId === currentTemplateId
        ) {
          // Check if we already have tabs for this template to prevent unnecessary loading
          const currentTabs = useMultiTabGraphBuilderStore.getState().tabs;
          const templateStore = useTemplateStore.getState();
          const template = templateStore.templates.find(
            (t) => t.id === currentTemplateId
          );

          if (template) {
            // Check if current tabs match template metrics
            const templateMetricIds = template.metrics
              .map((m: any) => m.id)
              .sort();
            const currentTabIds = currentTabs.map((tab) => tab.id).sort();

            const tabsMatch =
              currentTabIds.length === templateMetricIds.length &&
              currentTabIds.every(
                (id, index) => id === templateMetricIds[index]
              );

            if (!tabsMatch) {
              console.log(
                "Loading tabs from template in GraphToolbar:",
                currentTemplateId
              );
              loadTabsFromTemplate(currentTemplateId);
            } else {
              console.log(
                "Tabs already match template, skipping load:",
                currentTemplateId
              );
            }
          }
        }
      }, 150); // Increased delay to give useAutoSave time to complete

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [tabMode, activeTemplateId]); // Removed loadTabsFromTemplate from dependencies to prevent re-runs

  // Reset functionality
  const handleResetApp = () => {
    const success = clearAppStateFromLocalStorage();

    if (success) {
      // Reset current state using store methods
      useTemplateStore.setState({
        templates: [],
        activeTemplateId: null,
      });

      useMultiTabGraphBuilderStore.setState({
        tabs: [],
        activeTabId: null,
        tabCanvasStores: new Map(),
        isUndoRedoOperation: false,
      });

      useGraphBuilderStore.setState({
        nodes: [],
        selectedNodeId: null,
        template: null,
      });

      toast.success("Application réinitialisée avec succès");

      // Reload the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error("Erreur lors de la réinitialisation");
    }
  };

  const handleExport = () => {
    if (!tabMode) {
      // Single tab mode
      const data = exportSingleGraph();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template_${template?.code || "untitled"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Multi-tab mode - show dialog to choose export type
      const activeTab = getActiveTab();
      if (!activeTab) {
        toast.error("Aucun onglet actif");
        return;
      }
      setIsExportDialogOpen(true);
    }
  };

  const handleExportTemplate = () => {
    // Export the complete template
    const { activeTemplateId, exportTemplate } = useTemplateStore.getState();
    if (!activeTemplateId) {
      toast.error("Aucun template actif");
      return;
    }

    const templateData = exportTemplate(activeTemplateId);
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
    setIsExportDialogOpen(false);
  };

  const handleExportMetric = () => {
    // Export just the current metric
    const activeTab = getActiveTab();
    if (!activeTab) return;

    const data = {
      name: activeTab.name,
      nodes: activeTab.nodes,
      connections: activeTab.connections,
      position: activeTab.position,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metric_${activeTab.name
      .toLowerCase()
      .replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportDialogOpen(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!tabMode) {
          importSingleGraph(data);
        } else {
          // Multi-tab mode - import a metric or a complete template
          try {
            // Check if it's a template with metrics
            if (data.metrics && Array.isArray(data.metrics)) {
              // It's a template with metrics, import it
              const { importTemplate, setActiveTemplate } =
                useTemplateStore.getState();
              const templateId = importTemplate(data);
              setActiveTemplate(templateId);

              // Remove manual tab creation - let the useEffect handle it via loadTabsFromTemplate
              toast.success(
                "Template importé avec succès avec " +
                  data.metrics.length +
                  " métriques"
              );
            } else if (data.nodes && Array.isArray(data.nodes)) {
              // It's a single metric, always create a new tab for it
              const { activeTemplateId, addMetricToTemplate } =
                useTemplateStore.getState();

              if (!activeTemplateId) {
                toast.error("Veuillez d'abord sélectionner un template");
                return;
              }

              const tabId = createTab(data.name || "Métrique importée");
              importGraph(tabId, {
                nodes: data.nodes || [],
                connections: data.connections || [],
                position: data.position || { x: 0, y: 0, zoom: 1 },
              });
              setActiveTab(tabId);

              // Add the imported tab to the active template
              const newTab = useMultiTabGraphBuilderStore
                .getState()
                .tabs.find((t) => t.id === tabId);
              if (newTab && activeTemplateId) {
                addMetricToTemplate(activeTemplateId, newTab);
              }

              toast.success("Métrique importée dans un nouvel onglet");
            } else {
              toast.error("Format non reconnu");
            }
          } catch (parseError) {
            console.error("Template parse error:", parseError);
            toast.error("Erreur lors de l'analyse du template");
          }
        }
      } catch (error) {
        console.error("JSON parse error:", error);
        toast.error("Format JSON invalide");
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const handleCreateTemplate = () => {
    if (!templateForm.code || !templateForm.metric) {
      toast.error("Veuillez renseigner au moins le code et la métrique");
      return;
    }

    const newTemplate: CardTemplate = {
      code: templateForm.code,
      metric: templateForm.metric,
      version: templateForm.version || 1,
      root_id: "", // Will be set when the first node is created
    };

    setTemplate(newTemplate);
    setIsTemplateDialogOpen(false);
    toast.success("Template créé avec succès!");
  };

  const handleCreateCard = () => {
    if (!tabMode) {
      toast.error(
        "La création de carte n'est disponible qu'en mode multi-onglets"
      );
      return;
    }

    if (!activeTemplateId) {
      toast.error("Veuillez d'abord sélectionner un template");
      return;
    }

    try {
      const dbExport = exportForDatabase(activeTemplateId);
      if (!dbExport) {
        toast.error("Erreur lors de l'export de la carte");
        return;
      }

      const template = useTemplateStore
        .getState()
        .templates.find((t) => t.id === activeTemplateId);
      const filename = `card_${template?.name
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

      toast.success("Carte créée et téléchargée avec succès!");
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erreur lors de la création de la carte");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-background border-b">
      {/* Template Info */}
      {!tabMode && template ? (
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {template.code} v{template.version}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Métrique: {template.metric}
            </p>
          </CardHeader>
        </Card>
      ) : !tabMode ? (
        <div className="flex-1">
          <Dialog
            open={isTemplateDialogOpen}
            onOpenChange={setIsTemplateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="default">
                <Save className="h-4 w-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-code">Code du template</Label>
                  <Input
                    id="template-code"
                    value={templateForm.code}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    placeholder="ex: mean_basic"
                  />
                </div>
                <div>
                  <Label htmlFor="template-metric">Métrique</Label>
                  <Input
                    id="template-metric"
                    value={templateForm.metric}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        metric: e.target.value,
                      }))
                    }
                    placeholder="ex: mean"
                  />
                </div>
                <div>
                  <Label htmlFor="template-version">Version</Label>
                  <Input
                    id="template-version"
                    type="number"
                    value={templateForm.version}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        version: parseInt(e.target.value) || 1,
                      }))
                    }
                    min="1"
                  />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex-1">
          <h1 className="text-lg font-bold">Constructeur de formulaires</h1>
          <p className="text-sm text-muted-foreground">
            {tabs.length} métriques configurées • Auto-sauvegarde activée
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {tabMode && (
          <>
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsProjectManagerOpen(true)}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Gérer les templates
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={handleCreateCard}
              disabled={!activeTemplateId}
              title="Créer une carte (export pour base de données)"
            >
              <Database className="h-4 w-4 mr-2" />
              Créer carte
            </Button>

            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {/* Undo/Redo - Show for both modes */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              if (!isUndoRedoOperation) {
                undo();
              }
            }}
            disabled={!canUndo() || isUndoRedoOperation}
            title="Annuler (Ctrl+Z)"
            className="px-3"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={() => {
              if (!isUndoRedoOperation) {
                redo();
              }
            }}
            disabled={!canRedo() || isUndoRedoOperation}
            title="Refaire (Ctrl+Y)"
            className="px-3"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Auto Layout Controls */}
        <AutoLayoutControls tabMode={tabMode} />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Import/Export */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="default"
            onClick={handleExport}
            disabled={!tabMode && (!template || nodes.length === 0)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <label>
            <Button variant="outline" size="default" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {!tabMode && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="outline"
              size="default"
              onClick={clearGraph}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Reset Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="text-destructive hover:text-destructive"
              title="Réinitialiser toutes les données"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Réinitialiser l'application</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va supprimer définitivement :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tous les templates et métriques</li>
                  <li>Tous les onglets et graphiques</li>
                  <li>Les données sauvegardées en local</li>
                  <li>L'historique de l'application</li>
                </ul>
                L'application sera rechargée après la réinitialisation.
                <br />
                <strong>Cette action est irréversible.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetApp}
                className={buttonVariants({ variant: "destructive" })}
              >
                Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="w-px h-6 bg-border mx-1" />

        <ThemeToggle />
      </div>

      {/* Project Manager Dialog */}
      <Dialog
        open={isProjectManagerOpen}
        onOpenChange={setIsProjectManagerOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gestion des templates</DialogTitle>
            <DialogDescription>
              Créez, modifiez et exportez vos templates
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            <ProjectManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <AlertDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Choisir le type d&apos;exportation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous exporter le template complet avec toutes ses métriques
              ou seulement la métrique actuelle ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleExportMetric}>
              Métrique actuelle uniquement
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleExportTemplate}>
              Template complet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
