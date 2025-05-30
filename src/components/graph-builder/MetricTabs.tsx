"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";
import {
  Plus,
  X,
  Edit2,
  Check,
  X as XIcon,
  AlertCircle,
  ArrowUp,
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
    getActiveTab,
    setSelectedNodeInActiveTab,
  } = useMultiTabGraphBuilderStore();

  const { activeTemplateId, addMetricToTemplate, createTemplate } =
    useTemplateStore();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    version: "1.0",
    description: "",
  });

  const activeTab = getActiveTab();

  const handleCreateTab = () => {
    if (!activeTemplateId) {
      alert("Veuillez d'abord sélectionner ou créer un template");
      return;
    }
    const newTabId = createTab();

    // Add the new tab to the active template
    if (activeTemplateId) {
      const tab = tabs.find((t) => t.id === newTabId);
      if (tab) {
        addMetricToTemplate(activeTemplateId, tab);
      }
    }
  };

  const handleDeleteTab = (tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (tabs.length > 1) {
      deleteTab(tabId);
    }
  };

  const handleStartRename = (
    tabId: string,
    currentName: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingTabId(tabId);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (editingTabId && typeof editingName === "string" && editingName.trim()) {
      renameTab(editingTabId, editingName.trim());
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
      typeof newTemplate.name !== "string" ||
      !newTemplate.name.trim()
    ) {
      alert("Veuillez entrer un nom pour le template");
      return;
    }

    createTemplate(
      newTemplate.name.trim(),
      newTemplate.version,
      newTemplate.description
    );
    setIsCreatingTemplate(false);
    setNewTemplate({ name: "", version: "1.0", description: "" });
  };

  // Create first tab if none exist
  React.useEffect(() => {
    if (tabs.length === 0 && activeTemplateId) {
      createTab("Métrique 1");
    }
  }, [tabs.length, createTab, activeTemplateId]);

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
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nom du template</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="ex: Modèle de base"
                    />
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="template-description">
                      Description (optionnel)
                    </Label>
                    <Input
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description du template"
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

  if (tabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aucune métrique créée</p>
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
          <div className="flex items-center gap-2">
            <TabsList className="h-auto p-1 bg-muted/30">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative group">
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
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-6 px-1 text-xs w-20"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={handleSaveRename}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={handleCancelRename}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate">{tab.name}</span>
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) =>
                              handleStartRename(tab.id, tab.name, e)
                            }
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          {tabs.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={(e) => handleDeleteTab(tab.id, e)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateTab}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {activeTemplateId && activeTab && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  addMetricToTemplate(activeTemplateId, activeTab);
                  alert("Métrique sauvegardée dans le template");
                }}
                className="h-8 px-2"
                title="Sauvegarder la métrique actuelle dans le template"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="flex-1 p-0 m-0">
            <div className="h-full">
              <ResizablePanelGroup direction="horizontal">
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
                  <div className="h-full flex flex-col">
                    <Tabs
                      defaultValue="editor"
                      className="h-full flex flex-col"
                    >
                      <TabsList className="grid grid-cols-2 mx-4 mb-0 w-[calc(100%-2rem)]">
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
                        className="flex-1 p-4 overflow-auto"
                      >
                        {activeTab?.selectedNodeId ? (
                          <NodeEditor
                            nodeId={activeTab.selectedNodeId}
                            tabMode={true}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p>Sélectionnez un nœud pour l&apos;éditer</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent
                        value="preview"
                        className="flex-1 p-4 overflow-auto"
                      >
                        <FormPreview tabMode={true} />
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
