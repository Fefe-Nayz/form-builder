"use client";

import React, { useState, useEffect } from "react";
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
import { ProjectManager } from "./ProjectManager";
import { AutoLayoutControls } from "./AutoLayoutControls";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutoSave";
import { clearAppStateFromLocalStorage } from "@/lib/localStorage";
import { MetricTab } from "@/types/template";
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

  const { activeTemplateId, exportForDatabase } = useTemplateStore();

  // Initialize auto-save
  const { restorationComplete } = useAutoSave();

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

  // Trigger template loading after restoration completes (simulating manual template selection)
  useEffect(() => {
    if (!tabMode || !restorationComplete || !activeTemplateId) {
      return;
    }

    // Add a delay to ensure restoration is fully complete
    const timeoutId = setTimeout(() => {
      console.log(
        "Post-restoration: triggering template load for:",
        activeTemplateId
      );

      // Check if we need to load tabs for the active template
      const multiTabState = useMultiTabGraphBuilderStore.getState();
      const templateState = useTemplateStore.getState();

      const template = templateState.templates.find(
        (t) => t.id === activeTemplateId
      );

      if (template && template.metrics && template.metrics.length > 0) {
        // Only load if we don't have tabs or they don't match
        if (multiTabState.tabs.length === 0) {
          console.log("No tabs found after restoration, loading from template");
          loadTabsFromTemplate(activeTemplateId);
        } else {
          // Check if tabs match the template
          const templateMetricIds = new Set(template.metrics.map((m) => m.id));
          const currentTabIds = new Set(
            multiTabState.tabs.map((tab) => tab.id)
          );

          const allMetricsPresent = [...templateMetricIds].every((id) =>
            currentTabIds.has(id)
          );
          const hasExtraTabs = [...currentTabIds].some(
            (id) => !templateMetricIds.has(id)
          );

          if (!allMetricsPresent || hasExtraTabs) {
            console.log(
              "Tabs mismatch after restoration, reloading from template"
            );
            loadTabsFromTemplate(activeTemplateId);
          } else {
            console.log("Tabs already match template, setting active tab");
            if (!multiTabState.activeTabId && multiTabState.tabs.length > 0) {
              setActiveTab(multiTabState.tabs[0].id);
            }
          }
        }
      }
    }, 300); // Small delay after restoration completes

    return () => clearTimeout(timeoutId);
  }, [
    tabMode,
    restorationComplete,
    activeTemplateId,
    loadTabsFromTemplate,
    setActiveTab,
  ]);

  // Handle normal template switching (only after restoration is complete)
  useEffect(() => {
    if (!tabMode || !restorationComplete || !activeTemplateId) {
      return;
    }

    // This is for normal template switching, not post-restoration
    // Add a flag to distinguish from post-restoration loading
    const isPostRestoration =
      useMultiTabGraphBuilderStore.getState().tabs.length === 0;
    if (isPostRestoration) {
      return; // Let the post-restoration effect handle this
    }

    // Add a longer debounced delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      // Check loading state to prevent concurrent calls
      const multiTabState = useMultiTabGraphBuilderStore.getState();
      if (
        multiTabState.isLoadingTemplate ||
        multiTabState.isUndoRedoOperation
      ) {
        console.log(
          "Skipping template load - already loading or undo/redo in progress"
        );
        return;
      }

      // Double-check that the template ID is still the same
      const currentState = useTemplateStore.getState();
      if (currentState.activeTemplateId !== activeTemplateId) {
        console.log("Template ID changed during delay, skipping load");
        return;
      }

      // Check if we already have tabs for this template to prevent unnecessary loading
      const currentTabs = multiTabState.tabs;
      const template = currentState.templates.find(
        (t) => t.id === activeTemplateId
      );

      if (!template?.metrics) {
        console.log("No template or metrics found for:", activeTemplateId);
        return;
      }

      // Check if current tabs match template metrics by ID
      const templateMetricIds = new Set(
        template.metrics.map((m: MetricTab) => m.id)
      );
      const currentTabIds = new Set(currentTabs.map((tab) => tab.id));

      // More robust matching - check if ALL template metrics are present as tabs
      const allMetricsPresent = [...templateMetricIds].every((id) =>
        currentTabIds.has(id)
      );

      // Also check if there are extra tabs that shouldn't be there
      const hasExtraTabs = [...currentTabIds].some(
        (id) => !templateMetricIds.has(id)
      );

      if (!allMetricsPresent || hasExtraTabs) {
        console.log(
          "Normal template switch: Tabs don't match template, loading:",
          activeTemplateId,
          "Template metrics:",
          templateMetricIds.size,
          "Current tabs:",
          currentTabIds.size,
          "All metrics present:",
          allMetricsPresent,
          "Has extra tabs:",
          hasExtraTabs
        );
        loadTabsFromTemplate(activeTemplateId);
      } else {
        // Tabs match, just ensure we have an active tab
        if (!multiTabState.activeTabId && currentTabs.length > 0) {
          console.log("Setting active tab since none is selected");
          setActiveTab(currentTabs[0].id);
        }
      }
    }, 800); // Longer delay to give state changes time to settle

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    tabMode,
    restorationComplete,
    activeTemplateId,
    loadTabsFromTemplate,
    setActiveTab,
  ]);

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
        {restorationComplete ? (
          <AutoLayoutControls tabMode={tabMode} />
        ) : (
          <div className="w-24 h-8" /> // Placeholder to maintain layout
        )}

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
              <AlertDialogTitle>
                Réinitialiser l&apos;application
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va supprimer définitivement :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tous les templates et métriques</li>
                  <li>Tous les onglets et graphiques</li>
                  <li>Les données sauvegardées en local</li>
                  <li>L&apos;historique de l&apos;application</li>
                </ul>
                L&apos;application sera rechargée après la réinitialisation.
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
      {restorationComplete && (
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
      )}

      {/* Export Dialog */}
      {restorationComplete && (
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
                Voulez-vous exporter le template complet avec toutes ses
                métriques ou seulement la métrique actuelle ?
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
      )}
    </div>
  );
}
