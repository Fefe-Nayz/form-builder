"use client";

import React, { useCallback, memo, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Copy, Plus, X } from "lucide-react";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { ParamNode, PARAM_TYPES, EnumOption } from "@/types/graph-builder";
import { toast } from "sonner";

interface NodeEditorProps {
  nodeId: string;
  tabMode?: boolean;
}

interface EnumOptionCardProps {
  option: EnumOption;
  index: number;
  onUpdate: (index: number, field: string, value: string | undefined) => void;
  onDelete: (index: number) => void;
  node: ParamNode;
  onCreateChild: (option: EnumOption) => void;
  tabMode?: boolean;
}

// Composant séparé pour éviter les re-renders lors de l'édition
const EnumOptionCard = memo(
  ({
    option,
    index,
    onUpdate,
    onDelete,

    onCreateChild,
    tabMode = false,
  }: EnumOptionCardProps) => {
    const singleTabStore = useGraphBuilderStore();
    const multiTabStore = useMultiTabGraphBuilderStore();

    // Use the appropriate store based on tabMode
    const nodes = useMemo(
      () =>
        tabMode
          ? multiTabStore.getActiveTab()?.nodes || []
          : singleTabStore.nodes,
      [tabMode, multiTabStore, singleTabStore]
    );
    const updateNode = tabMode
      ? multiTabStore.updateNodeInActiveTab
      : singleTabStore.updateNode;
    const deleteNode = tabMode
      ? multiTabStore.deleteNodeFromActiveTab
      : singleTabStore.deleteNode;

    const handleFieldChange = useCallback(
      (field: string, value: string | undefined) => {
        onUpdate(index, field, value);

        // If the ID of the option changed, update any child nodes' conditions
        if (field === "id") {
          const oldId = option.id;
          const newId = value;

          // Find child nodes with conditions matching this option
          nodes.forEach((childNode) => {
            if (
              childNode.condition &&
              childNode.condition.includes(`"${oldId}"`)
            ) {
              // Update the condition with the new option ID
              const newCondition = childNode.condition.replace(
                `"${oldId}"`,
                `"${newId}"`
              );
              updateNode(childNode.id, { condition: newCondition });
            }
          });
        }
      },
      [index, onUpdate, option.id, nodes, updateNode]
    );

    const handleDelete = useCallback(() => {
      // Before deleting the option, find and delete any child nodes that depend on it
      nodes.forEach((childNode) => {
        if (
          childNode.condition &&
          childNode.condition.includes(`"${option.id}"`)
        ) {
          deleteNode(childNode.id);
        }
      });

      onDelete(index);
    }, [index, onDelete, option.id, nodes, deleteNode]);

    // Check if this option already has a child node
    const hasChildNode = nodes.some(
      (childNode) =>
        childNode.condition && childNode.condition.includes(`"${option.id}"`)
    );

    return (
      <Card key={`enum-${index}`} className="relative">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Option {index + 1}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {option.id || "Sans ID"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pr-10">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">ID technique</Label>
              <Input
                value={option.id}
                onChange={(e) => handleFieldChange("id", e.target.value)}
                placeholder="ex: global, subject, custom_subject"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Label FR</Label>
                <Input
                  value={option.label_json.fr || ""}
                  onChange={(e) =>
                    handleFieldChange("label_fr", e.target.value)
                  }
                  placeholder="ex: Global"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Label EN</Label>
                <Input
                  value={option.label_json.en || ""}
                  onChange={(e) =>
                    handleFieldChange("label_en", e.target.value)
                  }
                  placeholder="ex: Global"
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Valeur technique (optionnel)</Label>
              <Input
                value={option.value || ""}
                onChange={(e) => handleFieldChange("value", e.target.value)}
                placeholder="Si différente de l'ID"
                className="text-sm"
              />
            </div>

            {/* Create Child Button */}
            <div className="pt-2 border-t">
              {hasChildNode ? (
                <div className="text-xs text-muted-foreground">
                  ✓ Nœud enfant créé pour cette option
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateChild(option)}
                  className="w-full"
                  disabled={!option.id}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Créer nœud enfant
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

EnumOptionCard.displayName = "EnumOptionCard";

export function NodeEditor({ nodeId, tabMode = false }: NodeEditorProps) {
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  // Use the appropriate store based on tabMode
  const nodes = useMemo(
    () =>
      tabMode
        ? multiTabStore.getActiveTab()?.nodes || []
        : singleTabStore.nodes,
    [tabMode, multiTabStore, singleTabStore]
  );
  const updateNode = tabMode
    ? multiTabStore.updateNodeInActiveTab
    : singleTabStore.updateNode;
  const deleteNode = tabMode
    ? multiTabStore.deleteNodeFromActiveTab
    : singleTabStore.deleteNode;
  const addNode = tabMode
    ? multiTabStore.addNodeToActiveTab
    : singleTabStore.addNode;

  const node = nodes.find((n) => n.id === nodeId);

  // Define all hooks before any conditional returns
  const handleLabelChange = useCallback(
    (lang: string, value: string) => {
      if (!node) return;
      updateNode(nodeId, {
        label_json: { ...node.label_json, [lang]: value },
      });
    },
    [nodeId, node, updateNode]
  );

  const handleHelpChange = useCallback(
    (lang: string, value: string) => {
      if (!node) return;
      updateNode(nodeId, {
        help_json: { ...node.help_json, [lang]: value },
      });
    },
    [nodeId, node, updateNode]
  );

  const handleMetaChange = useCallback(
    (
      key: string,
      value:
        | string
        | number
        | boolean
        | EnumOption[]
        | Record<string, string>
        | undefined
    ) => {
      if (!node) return;
      updateNode(nodeId, {
        meta_json: { ...node.meta_json, [key]: value },
      });
    },
    [nodeId, node, updateNode]
  );
  const handleEnumOptionChange = useCallback(
    (index: number, field: string, value: string | undefined) => {
      if (!node) return;
      const currentOptions: EnumOption[] = node.meta_json?.enumOptions || [];
      const updatedOptions = [...currentOptions];
      const oldOption = { ...updatedOptions[index] };

      if (field === "id" || field === "value") {
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      } else if (field.startsWith("label_")) {
        const lang = field.split("_")[1];
        updatedOptions[index] = {
          ...updatedOptions[index],
          label_json: {
            ...updatedOptions[index].label_json,
            [lang]: value || "",
          },
        };
      }

      // If we&apos;re changing labels, update child node labels to match
      if (field.startsWith("label_") && field !== "label_json") {
        const lang = field.split("_")[1];
        const optionId = oldOption.id;

        // Find child nodes with conditions matching this option
        nodes.forEach((childNode) => {
          if (
            childNode.parent_id === node.id &&
            childNode.condition &&
            childNode.condition.includes(
              `{&quot;var&quot;: &quot;parent&quot;}, &quot;${optionId}&quot;`
            )
          ) {
            // Update the child node&apos;s label
            const newLabel = { ...childNode.label_json };
            newLabel[lang] = `Option: ${value || optionId}`;
            updateNode(childNode.id, { label_json: newLabel });
          }
        });
      }

      handleMetaChange("enumOptions", updatedOptions);
    },
    [node, nodes, updateNode, handleMetaChange]
  );

  const handleEnumOptionDelete = useCallback(
    (index: number) => {
      if (!node) return;
      const currentOptions: EnumOption[] = node.meta_json?.enumOptions || [];
      const updatedOptions = currentOptions.filter((_, i) => i !== index);
      handleMetaChange("enumOptions", updatedOptions);
    },
    [node, handleMetaChange]
  );

  const handleDuplicate = useCallback(() => {
    if (!node) return;
    const newNode = {
      ...node,
      key: `${node.key}_copy`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
    };
    delete (newNode as Partial<ParamNode>).id;
    addNode(newNode);
    toast.success(`Nœud "${node.key}" dupliqué avec succès`);
  }, [node, addNode]);

  const handleCreateChild = useCallback(
    (option: EnumOption) => {
      if (!node || !option.id) {
        toast.error(
          "Impossible de créer le nœud enfant: option ou nœud invalide"
        );
        return;
      }

      // Create a child node for this enum option
      const childNode: Omit<ParamNode, "id"> = {
        key: `${node.key}_${option.id}`,
        label_json: {
          fr: `Option: ${option.label_json.fr || option.id}`,
          en: `Option: ${option.label_json.en || option.id}`,
        },
        type_id: 3, // string type by default
        order: node.order + 1,
        position: {
          x: node.position.x + 250,
          y: node.position.y + 50,
        },
        parent_id: tabMode ? undefined : node.id, // Only set parent_id in single-tab mode
        condition: `{"==": [{"var": "${node.key}"}, "${option.id}"]}`,
      };

      const childNodeId = addNode(childNode);

      // In multi-tab mode, create a connection
      if (tabMode && childNodeId) {
        multiTabStore.addConnectionToActiveTab({
          source: node.id,
          target: childNodeId,
          condition: `{"==": [{"var": "${node.key}"}, "${option.id}"]}`,
        });
      }

      toast.success(
        `Nœud enfant créé pour l'option "${option.label_json.fr || option.id}"`
      );
    },
    [node, addNode, tabMode, multiTabStore]
  );

  // Early return after all hooks are defined
  if (!node) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Sélectionnez un nœud pour l&apos;éditer
          </p>
        </CardContent>
      </Card>
    );
  }

  const paramType = PARAM_TYPES.find((t) => t.id === node.type_id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Éditer le nœud</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteNode(nodeId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge variant="outline">{paramType?.code || "unknown"}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="key">Clé</Label>
          <Input
            id="key"
            value={node.key}
            onChange={(e) => updateNode(nodeId, { key: e.target.value })}
            placeholder="ex: subject_id"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={node.type_id.toString()}
            onValueChange={(value) =>
              updateNode(nodeId, { type_id: parseInt(value) })
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
        </div>{" "}
        <div className="space-y-2">
          <Label htmlFor="order">Ordre d&apos;affichage</Label>
          <Input
            id="order"
            type="number"
            value={node.order}
            onChange={(e) =>
              updateNode(nodeId, { order: parseInt(e.target.value) || 0 })
            }
            placeholder="0 = premier champ affiché"
          />
          <p className="text-xs text-muted-foreground">
            <strong>Ordre :</strong> Plus le nombre est petit, plus tôt le champ
            apparaît dans le formulaire.
            <br />
            <strong>Connexions :</strong> Lors d&apos;une connexion, le nœud
            avec l&apos;ordre le plus <em>faible</em> devient automatiquement
            l&apos;enfant de l&apos;autre.
          </p>
        </div>
        {/* Labels */}
        <div className="space-y-2">
          <Label>Labels</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="label-fr" className="text-xs">
                Français
              </Label>
              <Input
                id="label-fr"
                value={node.label_json?.fr || ""}
                onChange={(e) => handleLabelChange("fr", e.target.value)}
                placeholder="ex: Matière"
              />
            </div>
            <div>
              <Label htmlFor="label-en" className="text-xs">
                English
              </Label>
              <Input
                id="label-en"
                value={node.label_json?.en || ""}
                onChange={(e) => handleLabelChange("en", e.target.value)}
                placeholder="ex: Subject"
              />
            </div>
          </div>
        </div>
        {/* Help Text */}
        <div className="space-y-2">
          <Label>Aide</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="help-fr" className="text-xs">
                Français
              </Label>
              <Textarea
                id="help-fr"
                value={node.help_json?.fr || ""}
                onChange={(e) => handleHelpChange("fr", e.target.value)}
                placeholder="Texte d'aide en français"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="help-en" className="text-xs">
                English
              </Label>
              <Textarea
                id="help-en"
                value={node.help_json?.en || ""}
                onChange={(e) => handleHelpChange("en", e.target.value)}
                placeholder="Help text in English"
                rows={2}
              />
            </div>
          </div>
        </div>
        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition">Condition (JSON-Logic)</Label>
          <Textarea
            id="condition"
            value={node.condition || ""}
            onChange={(e) => updateNode(nodeId, { condition: e.target.value })}
            placeholder='{"===": [{"var": "scope"}, "subject"]}'
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Condition qui détermine quand ce champ est affiché. Utilise
            JSON-Logic.
          </p>
        </div>
        {/* Additional Options */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-sm">Options avancées</h4>

          {/* Required Field */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={node.meta_json?.required || false}
              onCheckedChange={(checked) =>
                handleMetaChange("required", checked)
              }
            />
            <Label htmlFor="required" className="text-sm">
              Champ obligatoire
            </Label>
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="placeholder-fr" className="text-xs">
                  Français
                </Label>
                <Input
                  id="placeholder-fr"
                  value={node.meta_json?.placeholder?.fr || ""}
                  onChange={(e) =>
                    handleMetaChange("placeholder", {
                      ...node.meta_json?.placeholder,
                      fr: e.target.value,
                    })
                  }
                  placeholder="ex: Entrez votre nom"
                />
              </div>
              <div>
                <Label htmlFor="placeholder-en" className="text-xs">
                  English
                </Label>
                <Input
                  id="placeholder-en"
                  value={node.meta_json?.placeholder?.en || ""}
                  onChange={(e) =>
                    handleMetaChange("placeholder", {
                      ...node.meta_json?.placeholder,
                      en: e.target.value,
                    })
                  }
                  placeholder="ex: Enter your name"
                />
              </div>
            </div>
          </div>

          {/* Default Value */}
          {(paramType?.code === "string" ||
            paramType?.code === "integer" ||
            paramType?.code === "float" ||
            paramType?.code === "enum") && (
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Valeur par défaut</Label>
              <Input
                id="defaultValue"
                value={node.meta_json?.defaultValue || ""}
                onChange={(e) =>
                  handleMetaChange("defaultValue", e.target.value)
                }
                placeholder="Valeur sélectionnée par défaut"
              />
            </div>
          )}

          {/* String-specific options */}
          {paramType?.code === "string" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="maxLength">Longueur maximale</Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={node.meta_json?.maxLength || ""}
                  onChange={(e) =>
                    handleMetaChange(
                      "maxLength",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="255"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern de validation (RegEx)</Label>
                <Input
                  id="pattern"
                  value={node.meta_json?.pattern || ""}
                  onChange={(e) => handleMetaChange("pattern", e.target.value)}
                  placeholder="ex: ^[A-Za-z0-9]+$"
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiline"
                  checked={node.meta_json?.multiline || false}
                  onCheckedChange={(checked) =>
                    handleMetaChange("multiline", checked)
                  }
                />
                <Label htmlFor="multiline" className="text-sm">
                  Champ multi-lignes (textarea)
                </Label>
              </div>
            </>
          )}
        </div>{" "}
        {/* Meta (Type-specific) */}
        {paramType?.code === "enum" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options de l&apos;énumération</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const currentOptions: EnumOption[] =
                    node.meta_json?.enumOptions || [];
                  const newOption: EnumOption = {
                    id: `option_${Date.now()}`,
                    label_json: { fr: "", en: "" },
                  };

                  // Only add the new option - no automatic child creation
                  handleMetaChange("enumOptions", [
                    ...currentOptions,
                    newOption,
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-auto">
              {(node.meta_json?.enumOptions || []).map(
                (option: EnumOption, index: number) => (
                  <EnumOptionCard
                    key={index}
                    option={option}
                    index={index}
                    onUpdate={handleEnumOptionChange}
                    onDelete={handleEnumOptionDelete}
                    node={node}
                    onCreateChild={handleCreateChild}
                    tabMode={tabMode}
                  />
                )
              )}

              {(!node.meta_json?.enumOptions ||
                node.meta_json.enumOptions.length === 0) && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Aucune option définie. Cliquez sur &quot;Ajouter&quot; pour
                  commencer.
                </div>
              )}
            </div>
          </div>
        )}
        {(paramType?.code === "integer" || paramType?.code === "float") && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min">Min</Label>
              <Input
                id="min"
                type="number"
                value={node.meta_json?.min || ""}
                onChange={(e) =>
                  handleMetaChange(
                    "min",
                    parseFloat(e.target.value) || undefined
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="max">Max</Label>
              <Input
                id="max"
                type="number"
                value={node.meta_json?.max || ""}
                onChange={(e) =>
                  handleMetaChange(
                    "max",
                    parseFloat(e.target.value) || undefined
                  )
                }
              />
            </div>
          </div>
        )}
        {paramType?.code === "reference" && (
          <div className="space-y-2">
            <Label htmlFor="referenceEntity">Entité référencée</Label>
            <Input
              id="referenceEntity"
              value={node.meta_json?.referenceEntity || ""}
              onChange={(e) =>
                handleMetaChange("referenceEntity", e.target.value)
              }
              placeholder="ex: Subject, Note, User"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
