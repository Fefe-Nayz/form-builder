"use client";

import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { ParamNode, EnumOption } from "@/types/graph-builder";
import JsonLogic from "json-logic-js";

// Mock form generator based on the graph structure
export function FormPreview({ tabMode = false }: { tabMode?: boolean }) {
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  // Use the appropriate store based on tabMode
  const nodes = tabMode
    ? multiTabStore.getActiveTab()?.nodes || []
    : singleTabStore.nodes;
  const template = tabMode ? null : singleTabStore.template;

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  // Get root nodes (no parent_id) sorted by order
  const rootNodes = nodes
    .filter((node) => !node.parent_id)
    .sort((a, b) => a.order - b.order);

  // Get children of a node sorted by order
  const getChildren = (parentId: string): ParamNode[] => {
    return nodes
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

    const handleChange = (value: unknown) => {
      setFormData((prev) => ({ ...prev, [node.key]: value }));
    };

    let input;
    switch (node.type_id) {
      case 1: // integer
      case 2: // float
        input = (
          <Input
            type="number"
            value={
              typeof formData[node.key] === "number"
                ? (formData[node.key] as number)
                : ""
            }
            onChange={(e) =>
              handleChange(parseFloat(e.target.value) || undefined)
            }
            min={node.meta_json?.min}
            max={node.meta_json?.max}
          />
        );
        break;

      case 3: // string
        input = (
          <Input
            type="text"
            value={
              typeof formData[node.key] === "string"
                ? (formData[node.key] as string)
                : ""
            }
            onChange={(e) => handleChange(e.target.value)}
          />
        );
        break;

      case 4: // enum
        const enumOptions: EnumOption[] = node.meta_json?.enumOptions || [];
        input = (
          <Select
            value={
              typeof formData[node.key] === "string"
                ? (formData[node.key] as string)
                : ""
            }
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
        input = (
          <Input
            type="date"
            value={
              typeof formData[node.key] === "string"
                ? (formData[node.key] as string)
                : ""
            }
            onChange={(e) => handleChange(e.target.value)}
          />
        );
        break;

      case 6: // boolean
        input = (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={
                typeof formData[node.key] === "boolean"
                  ? (formData[node.key] as boolean)
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
            value={
              typeof formData[node.key] === "string"
                ? (formData[node.key] as string)
                : ""
            }
            onChange={(e) => handleChange(e.target.value)}
          />
        );
        break;

      default:
        input = (
          <Input
            type="text"
            value={
              typeof formData[node.key] === "string"
                ? (formData[node.key] as string)
                : ""
            }
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

  if (nodes.length === 0) {
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
        {template && (
          <p className="text-sm text-muted-foreground">
            Template: {template.code} (v{template.version})
          </p>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {rootNodes
              .sort((a, b) => a.order - b.order)
              .map((node) => renderField(node))}

            <div className="pt-4 border-t">
              <Button type="submit" className="w-full">
                Créer la carte
              </Button>
            </div>
          </form>
        </ScrollArea>

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
