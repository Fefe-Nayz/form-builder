"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTemplateStore } from "@/stores/template-store";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { Trash, Play, ArrowRightLeft, Copy } from "lucide-react";
import { MetricTab } from "@/types/template";
import { toast } from "sonner";

export function TemplateManager() {
  const {
    templates,
    activeTemplateId,
    getActiveTemplate,
    setActiveTemplate,
    deleteMetricFromTemplate,
    convertMetricTabToGraphTab,
    transferMetricsToTemplate,
    addMetricToTemplate,
  } = useTemplateStore();

  const { tabs, createTab, importGraph, deleteTab, setActiveTabById } =
    useMultiTabGraphBuilderStore();

  const activeTemplate = getActiveTemplate();
  const [selectedTab, setSelectedTab] = useState<"templates" | "metrics">(
    "templates"
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    templateId: string;
    metricId: string;
    metricName: string;
  }>({
    isOpen: false,
    templateId: "",
    metricId: "",
    metricName: "",
  });

  const [transferDialog, setTransferDialog] = useState<{
    isOpen: boolean;
    sourceTemplateId: string;
    targetTemplateId: string;
    selectedMetrics: string[];
  }>({
    isOpen: false,
    sourceTemplateId: "",
    targetTemplateId: "",
    selectedMetrics: [],
  });

  if (templates.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Aucun template disponible</p>
          <p className="text-sm text-muted-foreground mt-2">
            Utilisez le gestionnaire de projets pour créer un template
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleLoadMetric = (metricTab: MetricTab) => {
    // Check if a tab with this ID already exists
    const existingTabIndex = tabs.findIndex((tab) => tab.id === metricTab.id);

    if (existingTabIndex >= 0) {
      // Tab exists, just switch to it
      setActiveTabById(metricTab.id);
      toast.success(`L'onglet "${metricTab.name}" a été activé.`);
    } else {
      // Create a new tab with the same ID as the metric
      const newTab = {
        id: metricTab.id,
        name: metricTab.name,
        nodes: metricTab.nodes,
        connections: metricTab.connections,
        selectedNodeId: null,
        position: metricTab.position,
      };

      // Add the tab directly to the store with the correct ID
      useMultiTabGraphBuilderStore.setState((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: metricTab.id,
      }));

      toast.success(
        `Métrique "${metricTab.name}" chargée dans un nouvel onglet.`
      );
    }
  };

  const handleDeleteMetric = (
    templateId: string,
    metricId: string,
    metricName: string
  ) => {
    setDeleteDialog({
      isOpen: true,
      templateId,
      metricId,
      metricName,
    });
  };

  const confirmDeleteMetric = () => {
    deleteMetricFromTemplate(deleteDialog.templateId, deleteDialog.metricId);

    // Close the tab if it's open
    const tabToClose = tabs.find((tab) => tab.id === deleteDialog.metricId);
    if (tabToClose) {
      deleteTab(deleteDialog.metricId);
    }

    toast.success(
      `Métrique "${deleteDialog.metricName}" supprimée avec succès`
    );
    setDeleteDialog({
      isOpen: false,
      templateId: "",
      metricId: "",
      metricName: "",
    });
  };

  const handleTransferMetrics = () => {
    if (!activeTemplate) return;

    setTransferDialog({
      isOpen: true,
      sourceTemplateId: activeTemplate.id,
      targetTemplateId: "",
      selectedMetrics: [],
    });
  };

  const confirmTransferMetrics = () => {
    if (
      !transferDialog.sourceTemplateId ||
      !transferDialog.targetTemplateId ||
      transferDialog.selectedMetrics.length === 0
    ) {
      toast.error(
        "Veuillez sélectionner un template de destination et au moins une métrique"
      );
      return;
    }

    transferMetricsToTemplate(
      transferDialog.sourceTemplateId,
      transferDialog.targetTemplateId,
      transferDialog.selectedMetrics
    );

    toast.success(
      `${transferDialog.selectedMetrics.length} métrique(s) transférée(s) avec succès`
    );

    setTransferDialog({
      isOpen: false,
      sourceTemplateId: "",
      targetTemplateId: "",
      selectedMetrics: [],
    });
  };

  const handleDuplicateMetric = (metric: MetricTab) => {
    if (!activeTemplate) return;

    // Generate a unique ID for the duplicated metric
    const duplicatedId = `metric_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create a copy of the metric with a new ID and name
    const duplicatedMetric: MetricTab = {
      ...metric,
      id: duplicatedId,
      name: `${metric.name} (Copie)`,
      // Deep copy nodes and connections with new IDs
      nodes: metric.nodes.map((node) => ({
        ...node,
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      connections: metric.connections.map((conn) => ({
        ...conn,
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    // Update connections to reference new node IDs
    const nodeIdMap: Record<string, string> = {};
    metric.nodes.forEach((oldNode, index) => {
      nodeIdMap[oldNode.id] = duplicatedMetric.nodes[index].id;
    });

    duplicatedMetric.connections = duplicatedMetric.connections.map((conn) => ({
      ...conn,
      source: nodeIdMap[conn.source] || conn.source,
      target: nodeIdMap[conn.target] || conn.target,
    }));

    // Add to template first
    const graphTab = convertMetricTabToGraphTab(duplicatedMetric);
    addMetricToTemplate(activeTemplate.id, graphTab);

    // Create a new tab with the proper canvas store using the new method
    const { createTabWithId } = useMultiTabGraphBuilderStore.getState();

    createTabWithId(duplicatedId, {
      name: duplicatedMetric.name,
      nodes: duplicatedMetric.nodes,
      connections: duplicatedMetric.connections,
      selectedNodeId: null,
      position: duplicatedMetric.position,
    });

    toast.success(
      `Métrique "${metric.name}" dupliquée avec succès et ouverte dans un nouvel onglet`
    );
  };

  return (
    <Card className="h-fit flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Métriques disponibles</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs
          value={selectedTab}
          onValueChange={(value) =>
            setSelectedTab(value as "templates" | "metrics")
          }
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 p-4 pt-2 space-y-2">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-md cursor-pointer border transition-colors ${
                      activeTemplateId === template.id
                        ? "bg-primary/10 border-primary/20"
                        : "hover:bg-muted border-transparent"
                    }`}
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          v{template.version}
                        </p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {template.metrics.length} métriques
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        {template.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 p-4 pt-2">
            {!activeTemplate ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Sélectionnez un template pour voir ses métriques</p>
              </div>
            ) : activeTemplate.metrics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Ce template ne contient aucune métrique</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Transfer button */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTransferMetrics}
                    className="flex items-center gap-2"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Transférer des métriques
                  </Button>
                </div>

                <ScrollArea className="h-full">
                  <div className="space-y-2 pr-4">
                    {activeTemplate.metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{metric.name}</h3>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
                              onClick={() => handleLoadMetric(metric)}
                              title="Charger cette métrique"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                              onClick={() => handleDuplicateMetric(metric)}
                              title="Dupliquer cette métrique"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20 hover:text-destructive"
                              onClick={() =>
                                handleDeleteMetric(
                                  activeTemplate.id,
                                  metric.id,
                                  metric.name
                                )
                              }
                              title="Supprimer cette métrique"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.nodes.length} nœuds •{" "}
                          {metric.connections.length} connexions
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={() =>
          setDeleteDialog({
            isOpen: false,
            templateId: "",
            metricId: "",
            metricName: "",
          })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette métrique</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la métrique &quot;
              {deleteDialog.metricName}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMetric}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={transferDialog.isOpen}
        onOpenChange={() =>
          setTransferDialog({
            isOpen: false,
            sourceTemplateId: "",
            targetTemplateId: "",
            selectedMetrics: [],
          })
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transférer des métriques</DialogTitle>
            <DialogDescription>
              Sélectionnez les métriques à transférer vers un autre template
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetTemplate">Template de destination</Label>
              <Select
                value={transferDialog.targetTemplateId}
                onValueChange={(value) =>
                  setTransferDialog({
                    ...transferDialog,
                    targetTemplateId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le template de destination" />
                </SelectTrigger>
                <SelectContent>
                  {templates
                    .filter((t) => t.id !== activeTemplate?.id)
                    .map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} (v{template.version})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Métriques à transférer</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeTemplate?.metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={transferDialog.selectedMetrics.includes(
                        metric.id
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTransferDialog({
                            ...transferDialog,
                            selectedMetrics: [
                              ...transferDialog.selectedMetrics,
                              metric.id,
                            ],
                          });
                        } else {
                          setTransferDialog({
                            ...transferDialog,
                            selectedMetrics:
                              transferDialog.selectedMetrics.filter(
                                (id) => id !== metric.id
                              ),
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={metric.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {metric.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setTransferDialog({
                  isOpen: false,
                  sourceTemplateId: "",
                  targetTemplateId: "",
                  selectedMetrics: [],
                })
              }
            >
              Annuler
            </Button>
            <Button onClick={confirmTransferMetrics}>Transférer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
