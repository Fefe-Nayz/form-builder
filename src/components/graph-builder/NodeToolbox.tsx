"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertCircle } from "lucide-react";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { useTemplateStore } from "@/stores/template-store";
import { PARAM_TYPES } from "@/types/graph-builder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NodeToolboxProps {
  tabMode?: boolean;
}

export function NodeToolbox({ tabMode = false }: NodeToolboxProps) {
  // Use different store based on mode
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();
  const { activeTemplateId } = useTemplateStore();

  const addNode = tabMode
    ? multiTabStore.addNodeToActiveTab
    : singleTabStore.addNode;
  const nodes = tabMode
    ? multiTabStore.getActiveTab()?.nodes || []
    : singleTabStore.nodes;
  const [newNodeForm, setNewNodeForm] = useState({
    key: "",
    type_id: 1,
    label_fr: "",
    label_en: "",
    order: 0,
  });
  const handleAddNode = () => {
    if (!newNodeForm.key) {
      alert("Veuillez entrer une clé pour le nœud");
      return;
    }

    // Check if key already exists
    if (nodes.some((node) => node.key === newNodeForm.key)) {
      alert("Cette clé existe déjà");
      return;
    }

    const newNode = {
      key: newNodeForm.key,
      label_json: {
        fr: newNodeForm.label_fr || newNodeForm.key,
        en: newNodeForm.label_en || newNodeForm.key,
      },
      type_id: newNodeForm.type_id,
      order: newNodeForm.order,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      // For enum type, initialize an empty enumOptions array
      ...(newNodeForm.type_id === 4 && {
        meta_json: {
          enumOptions: [],
        },
      }),
    };

    addNode(newNode);

    // Reset form
    setNewNodeForm({
      key: "",
      type_id: 1,
      label_fr: "",
      label_en: "",
      order: nodes.length,
    });
  };

  // Show disabled state when in tab mode but no template is active
  if (tabMode && !activeTemplateId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ajouter un nœud</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template requis</AlertTitle>
            <AlertDescription>
              Sélectionnez un template pour commencer à ajouter des nœuds.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ajouter un nœud</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-key">Clé du paramètre</Label>
          <Input
            id="new-key"
            value={newNodeForm.key}
            onChange={(e) =>
              setNewNodeForm((prev) => ({ ...prev, key: e.target.value }))
            }
            placeholder="ex: subject_id"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-type">Type</Label>
          <Select
            value={newNodeForm.type_id.toString()}
            onValueChange={(value) =>
              setNewNodeForm((prev) => ({ ...prev, type_id: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARAM_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.code} ({type.widget})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="new-label-fr">Label FR</Label>
            <Input
              id="new-label-fr"
              value={newNodeForm.label_fr}
              onChange={(e) =>
                setNewNodeForm((prev) => ({
                  ...prev,
                  label_fr: e.target.value,
                }))
              }
              placeholder="Matière"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-label-en">Label EN</Label>
            <Input
              id="new-label-en"
              value={newNodeForm.label_en}
              onChange={(e) =>
                setNewNodeForm((prev) => ({
                  ...prev,
                  label_en: e.target.value,
                }))
              }
              placeholder="Subject"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-order">Ordre</Label>
          <Input
            id="new-order"
            type="number"
            value={newNodeForm.order}
            onChange={(e) =>
              setNewNodeForm((prev) => ({
                ...prev,
                order: parseInt(e.target.value) || 0,
              }))
            }
          />
        </div>

        <Button onClick={handleAddNode} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter le nœud
        </Button>

        {/* Quick Add Templates */}
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium">Templates rapides</Label>
          <div className="mt-2 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNewNodeForm({
                  key: "scope",
                  type_id: 4, // enum
                  label_fr: "Périmètre",
                  label_en: "Scope",
                  order: 0,
                })
              }
              className="w-full justify-start"
            >
              Scope (enum)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNewNodeForm({
                  key: "subject_id",
                  type_id: 7, // reference
                  label_fr: "Matière",
                  label_en: "Subject",
                  order: 1,
                })
              }
              className="w-full justify-start"
            >
              Subject ID (reference)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNewNodeForm({
                  key: "window_type",
                  type_id: 4, // enum
                  label_fr: "Fenêtre temporelle",
                  label_en: "Time Window",
                  order: 2,
                })
              }
              className="w-full justify-start"
            >
              Window Type (enum)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNewNodeForm({
                  key: "n",
                  type_id: 1, // integer
                  label_fr: "Nombre",
                  label_en: "Number",
                  order: 3,
                })
              }
              className="w-full justify-start"
            >
              N (integer)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
