"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTemplateStore } from "@/stores/template-store";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { Trash, ArrowRight } from "lucide-react";
import { MetricTab } from "@/types/template";

export function TemplateManager() {
  const {
    templates,
    activeTemplateId,
    getActiveTemplate,
    setActiveTemplate,
    deleteMetricFromTemplate,
    convertMetricTabToGraphTab,
  } = useTemplateStore();

  const { tabs, createTab, importGraph } = useMultiTabGraphBuilderStore();

  const activeTemplate = getActiveTemplate();
  const [selectedTab, setSelectedTab] = useState<"templates" | "metrics">(
    "templates"
  );

  if (templates.length === 0) {
    return (
      <Card>
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
    // Convert MetricTab to GraphTab format
    const graphTab = convertMetricTabToGraphTab(metricTab);

    // Check if a tab with this ID already exists
    const existingTabIndex = tabs.findIndex((tab) => tab.id === graphTab.id);

    if (existingTabIndex >= 0) {
      // Tab exists, just switch to it
      alert(`L'onglet "${graphTab.name}" existe déjà et sera activé.`);
    } else {
      // Create a new tab with the metric data
      const newTabId = createTab(graphTab.name);

      // Import nodes and connections into the new tab
      importGraph(newTabId, {
        nodes: graphTab.nodes,
        connections: graphTab.connections,
        position: graphTab.position,
      });
    }
  };

  const handleDeleteMetric = (
    templateId: string,
    metricId: string,
    metricName: string
  ) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer la métrique "${metricName}" ?`
      )
    ) {
      deleteMetricFromTemplate(templateId, metricId);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Métriques disponibles</CardTitle>
      </CardHeader>

      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          setSelectedTab(value as "templates" | "metrics")
        }
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="flex-1 p-4 pt-0">
          <ScrollArea className="h-[calc(100%-1rem)]">
            <div className="space-y-2 p-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-md cursor-pointer border ${
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

        <TabsContent value="metrics" className="flex-1 p-4 pt-0">
          {!activeTemplate ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Sélectionnez un template pour voir ses métriques</p>
            </div>
          ) : activeTemplate.metrics.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Ce template ne contient aucune métrique</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100%-1rem)]">
              <div className="space-y-2 p-1">
                {activeTemplate.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-3 rounded-md border hover:bg-muted/50"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{metric.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleLoadMetric(metric)}
                          title="Charger cette métrique"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
                      {metric.nodes.length} nœuds • {metric.connections.length}{" "}
                      connexions
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
