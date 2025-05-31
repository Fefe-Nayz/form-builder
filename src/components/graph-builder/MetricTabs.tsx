"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useTheme } from "next-themes";
import {
  Plus,
  X,
  Edit2,
  Check,
  X as XIcon,
  AlertCircle,
  Save,
  Database,
  RotateCcw,
  Download,
  Upload,
} from "lucide-react";
import { GraphCanvas } from "./GraphCanvas";
import { NodeEditor } from "./NodeEditor";
import { FormPreview } from "./FormPreview";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface MetricTabsProps {
  className?: string;
}

export function MetricTabs({ className }: MetricTabsProps) {
  const {
    tabs,
    activeTabId,
    createTab,
    deleteTab,
    renameTab,
    setActiveTab,
    setActiveTabById,
    getActiveTab,
    setSelectedNodeInActiveTab,
  } = useMultiTabGraphBuilderStore();

  const {
    activeTemplateId,
    addMetricToTemplate,
    saveMetricToTemplate,
    createTemplate,
    getActiveTemplate,
    updateMetricInTemplate,
  } = useTemplateStore();

  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();
  const templateStore = useTemplateStore();
  const { theme } = useTheme();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [autosave, setAutosave] = useState(true);
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    version: "1.0",
    description: "",
  });

  const activeTab = getActiveTab();
  const activeTemplate = getActiveTemplate();

  // Simple autosave without complex dependencies
  const handleAutosaveChange = (checked: boolean) => {
    setAutosave(checked);
  };

  // Filter tabs to show only those belonging to the active template
  const filteredTabs = React.useMemo(() => {
    if (!activeTemplateId || !activeTemplate?.metrics) return [];

    // Filter tabs to show only those that exist as metrics in the active template
    const templateMetricIds = new Set(
      activeTemplate.metrics.map((metric) => metric.id)
    );
    const filtered = tabs.filter((tab) => templateMetricIds.has(tab.id));

    return filtered;
  }, [tabs, activeTemplateId, activeTemplate?.metrics]);

  // Remove the problematic useEffect that was causing infinite loops
  // Template loading is now handled only in GraphToolbar to prevent conflicts

  // Ensure activeTabId points to a valid tab from filteredTabs
  React.useEffect(() => {
    if (filteredTabs.length > 0) {
      // Check if current activeTabId is in the filtered tabs
      const isActiveTabValid = filteredTabs.some(
        (tab) => tab.id === activeTabId
      );

      if (!isActiveTabValid) {
        // Set the first filtered tab as active
        console.log(
          "Setting first filtered tab as active:",
          filteredTabs[0].id
        );
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [filteredTabs, activeTabId, setActiveTab]);

  const handleCreateTab = () => {
    if (!activeTemplateId) {
      toast.error("Veuillez d'abord sélectionner ou créer un template");
      return;
    }

    const newTabId = createTab();

    // Immediately add the new tab to the active template
    // Use a more reliable approach by accessing the store state directly
    const newTab = useMultiTabGraphBuilderStore
      .getState()
      .tabs.find((t) => t.id === newTabId);
    if (newTab && activeTemplateId) {
      addMetricToTemplate(activeTemplateId, newTab);
      toast.success("Nouvelle métrique créée et ajoutée au template");
    }
  };

  const handleDeleteTab = (tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Allow closing any tab, including the last one
    deleteTab(tabId);
  };

  const handleStartRename = (
    tabId: string,
    currentName: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingTabId(tabId);
    setEditingName(typeof currentName === "string" ? currentName : "");
  };

  const handleSaveRename = () => {
    if (
      editingTabId &&
      editingName !== null &&
      editingName !== undefined &&
      typeof editingName === "string" &&
      editingName.trim()
    ) {
      const trimmedName = editingName.trim();

      // Rename the tab
      renameTab(editingTabId, trimmedName);

      // Also update the metric name in the template if it exists
      if (activeTemplateId && activeTemplate) {
        const metric = activeTemplate.metrics.find(
          (m) => m.id === editingTabId
        );
        if (metric) {
          updateMetricInTemplate(activeTemplateId, editingTabId, {
            name: trimmedName,
          });
        }
      }
    }
    setEditingTabId(null);
    setEditingName("");
  };

  const handleCancelRename = () => {
    setEditingTabId(null);
    setEditingName("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSaveRename();
    } else if (event.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleCreateTemplate = () => {
    if (
      !newTemplate.name ||
      newTemplate.name === null ||
      newTemplate.name === undefined ||
      typeof newTemplate.name !== "string" ||
      !newTemplate.name.trim()
    ) {
      toast.error("Veuillez entrer un nom pour le template");
      return;
    }

    createTemplate(
      newTemplate.name.trim(),
      newTemplate.version,
      newTemplate.description
    );
    setIsCreatingTemplate(false);
    setNewTemplate({ name: "", version: "1.0", description: "" });
    toast.success("Template créé avec succès");
  };

  // No template selected
  if (!activeTemplateId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md p-6">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucun template sélectionné</AlertTitle>
            <AlertDescription>
              Veuillez créer ou sélectionner un template pour commencer à
              travailler sur vos métriques.
            </AlertDescription>
          </Alert>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Utilisez le panneau &quot;Gestion des templates&quot; à gauche
              pour sélectionner un template, ou créez-en un nouveau ci-dessous.
            </p>
            <Dialog
              open={isCreatingTemplate}
              onOpenChange={setIsCreatingTemplate}
            >
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un nouveau template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau template</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nom du template</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          name: String(e.target.value || ""),
                        }))
                      }
                      placeholder="ex: Carte d'évaluation standard"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-version">Version</Label>
                    <Input
                      id="template-version"
                      value={newTemplate.version}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          version: e.target.value,
                        }))
                      }
                      placeholder="ex: 1.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-description">
                      Description (optionnelle)
                    </Label>
                    <Textarea
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description du template"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingTemplate(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleCreateTemplate}>Créer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  if (filteredTabs.length === 0 && activeTemplateId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Aucune métrique dans ce template
          </p>
          <Button onClick={handleCreateTab}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une métrique
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Tabs
        value={activeTabId || ""}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        {/* Custom Tab Header */}
        <div className="border-b bg-background px-4 py-2">
          <div className="flex items-center">
            {/* Container for tabs and buttons */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Scrollable Tab List */}
              <div className="overflow-x-auto scroll-area flex-shrink min-w-0">
                <TabsList className="h-auto p-1 bg-muted/30 inline-flex">
                  {filteredTabs.map((tab) => (
                    <div key={tab.id} className="relative group flex-shrink-0">
                      <TabsTrigger
                        value={tab.id}
                        className="px-3 py-2 relative pr-12 min-w-[120px] flex items-center justify-start"
                      >
                        {editingTabId === tab.id ? (
                          <div
                            className="flex items-center gap-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              value={editingName}
                              onChange={(e) =>
                                setEditingName(String(e.target.value || ""))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-6 px-1 text-xs w-20"
                              autoFocus
                            />
                            <div
                              className="h-5 w-5 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-400 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              onClick={handleSaveRename}
                            >
                              <Check className="h-3 w-3" />
                            </div>
                            <div
                              className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              onClick={handleCancelRename}
                            >
                              <XIcon className="h-3 w-3" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="truncate">
                              {String(tab.name || "")}
                            </span>
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                              <div
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted hover:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onClick={(e) =>
                                  handleStartRename(
                                    tab.id,
                                    String(tab.name || ""),
                                    e
                                  )
                                }
                              >
                                <Edit2 className="h-3 w-3" />
                              </div>
                              {/* Always show close button, even for the last tab */}
                              <div
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/20 hover:text-destructive inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onClick={(e) => handleDeleteTab(tab.id, e)}
                              >
                                <X className="h-3 w-3" />
                              </div>
                            </div>
                          </>
                        )}
                      </TabsTrigger>
                    </div>
                  ))}
                </TabsList>
              </div>

              {/* Action Buttons - positioned right after tabs */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateTab}
                  className="h-8 px-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* {activeTemplateId && activeTab && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      saveMetricToTemplate(activeTemplateId, activeTab);
                      toast.success("Métrique sauvegardée dans le template");
                    }}
                    className="h-8 px-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                    title="Sauvegarder manuellement la métrique actuelle dans le template"
                    disabled={autosave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {filteredTabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="flex-1 p-0 m-0 min-h-0"
          >
            <div className="h-full">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Center - Graph Canvas */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <GraphCanvas
                    onNodeSelect={setSelectedNodeInActiveTab}
                    tabMode={true}
                  />
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Sidebar */}
                <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                  <div className="h-full flex flex-col min-h-0">
                    <Tabs
                      defaultValue="editor"
                      className="h-full flex flex-col min-h-0"
                    >
                      <TabsList className="grid grid-cols-2 mx-4 mb-0 w-[calc(100%-2rem)] flex-shrink-0">
                        <TabsTrigger
                          value="editor"
                          className="px-2 py-1 text-sm"
                        >
                          Éditeur
                        </TabsTrigger>
                        <TabsTrigger
                          value="preview"
                          className="px-2 py-1 text-sm"
                        >
                          Aperçu
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="editor"
                        className="flex-1 p-0 m-0 min-h-0 overflow-hidden"
                      >
                        {activeTab?.selectedNodeId ? (
                          <div className="h-full p-4 overflow-y-auto">
                            <NodeEditor
                              nodeId={activeTab.selectedNodeId}
                              tabMode={true}
                            />
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p>Sélectionnez un nœud pour l&apos;éditer</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent
                        value="preview"
                        className="flex-1 p-0 m-0 min-h-0 overflow-hidden"
                      >
                        {activeTab?.nodes && activeTab.nodes.length > 0 ? (
                          <div className="h-full p-4 overflow-y-auto">
                            <FormPreview tabMode={true} />
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p>Aucun nœud à prévisualiser</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
