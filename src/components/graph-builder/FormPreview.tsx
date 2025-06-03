"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { ParamNode, EnumOption } from "@/types/graph-builder";
import JsonLogic from "json-logic-js";
import { useTemplateStore } from "@/stores/template-store";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useVariableStore } from "@/stores/variable-store";

// Mock form generator based on the graph structure
export function FormPreview({ tabMode = false }: { tabMode?: boolean }) {
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();
  const { activeTemplateId, exportForDatabase } = useTemplateStore();
  const { variables, updateVariableByKey } = useVariableStore();

  // Use appropriate store based on mode with useMemo to avoid dependency issues
  const storeNodes = useMemo(() => {
    return tabMode
      ? multiTabStore.getActiveTab()?.nodes || []
      : singleTabStore.nodes;
  }, [tabMode, multiTabStore, singleTabStore.nodes]);

  const storeTemplate = useMemo(() => {
    return tabMode ? null : singleTabStore.template;
  }, [tabMode, singleTabStore.template]);

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  // Get root nodes (no parent_id) sorted by order
  const rootNodes = storeNodes
    .filter((node) => !node.parent_id)
    .sort((a, b) => a.order - b.order);

  // Get children of a node sorted by order
  const getChildren = (parentId: string): ParamNode[] => {
    return storeNodes
      .filter((node) => node.parent_id === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Check if a node should be visible based on its condition
  const isNodeVisible = (node: ParamNode): boolean => {
    if (!node.condition) return true;

    try {
      const condition = JSON.parse(node.condition);
      return JsonLogic.apply(condition, formData);
    } catch {
      console.warn("Invalid JSON-Logic condition:", node.condition);
      return true;
    }
  };

  // Render a form field based on node type
  const renderField = (node: ParamNode) => {
    if (!isNodeVisible(node)) return null;

    const label = node.label_json?.fr || node.label_json?.en || node.key;
    const help = node.help_json?.fr || node.help_json?.en;

    let currentValue = formData[node.key];
    if (currentValue === undefined && node.variableKey) {
      const variable = variables.find((v) => v.key === node.variableKey);
      currentValue = variable?.value;
    }

    const handleChange = (value: unknown) => {
      setFormData((prev) => ({ ...prev, [node.key]: value }));
      if (node.variableKey) {
        updateVariableByKey(node.variableKey, { value: String(value ?? "") });
      }
    };

    let input;
    switch (node.type_id) {
      case 1: // integer
      case 2: // float
        input = (
          <Input
            type="number"
            value={
              typeof currentValue === "number" ? (currentValue as number) : ""
            }
            onChange={(e) =>
              handleChange(parseFloat(e.target.value) || undefined)
            }
            min={node.meta_json?.min}
            max={node.meta_json?.max}
            step={node.meta_json?.step}
          />
        );
        break;

      case 3: // string
        input = (
          <Input
            type="text"
            value={typeof currentValue === "string" ? (currentValue as string) : ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
        break;

      case 4: // enum
        const enumOptions: EnumOption[] = node.meta_json?.enumOptions || [];
        input = (
          <Select
            value={typeof currentValue === "string" ? (currentValue as string) : ""}
            onValueChange={(value) => handleChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Sélectionnez --" />
            </SelectTrigger>
            <SelectContent>
              {enumOptions.map((option: EnumOption) => (
                <SelectItem key={option.id} value={option.value || option.id}>
                  {option.label_json?.fr || option.label_json?.en || option.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case 5: // date
        const dateValue =
          typeof currentValue === "string" ? new Date(currentValue as string) : undefined;

        input = (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? (
                  format(dateValue, "PPP")
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) =>
                  handleChange(date?.toISOString().split("T")[0])
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        break;

      case 6: // boolean
        input = (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={
                typeof currentValue === "boolean"
                  ? (currentValue as boolean)
                  : false
              }
              onCheckedChange={(checked) => handleChange(checked)}
            />
            <Label className="text-sm">{label}</Label>
          </div>
        );
        break;

      case 7: // reference
        input = (
          <Input
            type="text"
            placeholder={`Rechercher ${
              node.meta_json?.referenceEntity || "entité"
            }`}
            value={typeof currentValue === "string" ? (currentValue as string) : ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
        break;

      default:
        input = (
          <Input
            type="text"
            value={typeof currentValue === "string" ? (currentValue as string) : ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }

    return (
      <div key={node.id} className="space-y-2">
        {node.type_id !== 6 && (
          <Label className="block text-sm font-medium">
            {label}
            {help && (
              <span className="block text-xs text-muted-foreground font-normal mt-1">
                {help}
              </span>
            )}
          </Label>
        )}
        {input}

        {/* Render children */}
        <div className="ml-4 space-y-4 border-l-2 border-border pl-4">
          {getChildren(node.id).map((child) => renderField(child))}
        </div>
      </div>
    );
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
        .replace(/\s+/g, "_")}_preview.json`;

      // Add current form data as example values
      const exportWithExample = {
        ...dbExport,
        example_instance: {
          values: formData,
          created_at: new Date().toISOString(),
        },
      };

      const blob = new Blob([JSON.stringify(exportWithExample, null, 2)], {
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

      toast.success("Carte créée avec les données d'exemple!");
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erreur lors de la création de la carte");
    }
  };

  if (storeNodes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Aucun nœud à prévisualiser. Ajoutez des nœuds au graphique.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Prévisualisation du formulaire
        </CardTitle>
        {storeTemplate && (
          <p className="text-sm text-muted-foreground">
            Template: {storeTemplate.code} (v{storeTemplate.version})
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {rootNodes
            .sort((a, b) => a.order - b.order)
            .map((node) => renderField(node))}

          <div className="pt-4 border-t">
            <Button type="submit" className="w-full" onClick={handleCreateCard}>
              Créer la carte
            </Button>
          </div>
        </form>

        {/* Debug: Show current form data */}
        <details className="mt-4">
          <summary className="text-sm font-medium cursor-pointer">
            Données du formulaire (debug)
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
