"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  NodeChange,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import "@xyflow/react/dist/style.css";

import ParamNodeComponent from "./ParamNodeComponent";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const nodeTypes = {
  paramNode: ParamNodeComponent,
};

interface GraphCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  tabMode?: boolean;
}

export function GraphCanvas({
  onNodeSelect,
  tabMode = false,
}: GraphCanvasProps) {
  const { theme } = useTheme();
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  // Use appropriate store based on mode with useMemo to avoid dependency issues
  const storeNodes = useMemo(() => {
    return tabMode
      ? multiTabStore.getActiveTab()?.nodes || []
      : singleTabStore.nodes;
  }, [tabMode, multiTabStore, singleTabStore.nodes]);

  const storeConnections = useMemo(() => {
    if (!tabMode) return [];
    const activeTab = multiTabStore.getActiveTab();
    return activeTab?.connections || [];
  }, [tabMode, multiTabStore]);

  const updateNode = useMemo(() => {
    return tabMode
      ? multiTabStore.updateNodeInActiveTab
      : singleTabStore.updateNode;
  }, [tabMode, multiTabStore.updateNodeInActiveTab, singleTabStore.updateNode]);

  const selectNode = useMemo(() => {
    return tabMode
      ? multiTabStore.setSelectedNodeInActiveTab
      : singleTabStore.selectNode;
  }, [
    tabMode,
    multiTabStore.setSelectedNodeInActiveTab,
    singleTabStore.selectNode,
  ]);

  const selectedNodeId = useMemo(() => {
    return tabMode
      ? multiTabStore.getActiveTab()?.selectedNodeId || null
      : singleTabStore.selectedNodeId;
  }, [tabMode, multiTabStore, singleTabStore.selectedNodeId]);

  const deleteNode = useMemo(() => {
    return tabMode
      ? multiTabStore.deleteNodeFromActiveTab
      : singleTabStore.deleteNode;
  }, [
    tabMode,
    multiTabStore.deleteNodeFromActiveTab,
    singleTabStore.deleteNode,
  ]);

  const [connectionDialog, setConnectionDialog] = useState<{
    isOpen: boolean;
    connection: Connection | null;
  }>({
    isOpen: false,
    connection: null,
  });
  const [condition, setCondition] = useState("");

  // Convert ParamNodes to ReactFlow nodes
  const reactFlowNodes: Node[] = useMemo(() => {
    return storeNodes.map((node) => ({
      id: node.id,
      type: "paramNode",
      position: node.position,
      data: node as unknown as Record<string, unknown>,
      selected: selectedNodeId === node.id,
    }));
  }, [storeNodes, selectedNodeId]);
  // Generate edges based on parent-child relationships or connections
  const reactFlowEdges: Edge[] = useMemo(() => {
    if (tabMode) {
      // Multi-tab mode: use connections array
      return storeConnections.map((connection) => ({
        id: connection.id,
        source: connection.source,
        target: connection.target,
        type: "smoothstep",
        animated: true,
        label: connection.condition ? "conditional" : undefined,
        style: {
          stroke: connection.condition ? "#3b82f6" : "#6b7280",
          strokeWidth: 2,
        },
      }));
    } else {
      // Single-tab mode: use parent_id on nodes
      return storeNodes
        .filter((node) => node.parent_id)
        .map((node) => ({
          id: `edge-${node.parent_id}-${node.id}`,
          source: node.parent_id!,
          target: node.id,
          type: "smoothstep",
          animated: true,
          label: node.condition ? "conditional" : undefined,
          style: {
            stroke: node.condition ? "#3b82f6" : "#6b7280",
            strokeWidth: 2,
          },
        }));
    }
  }, [storeNodes, storeConnections, tabMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update local state when store changes
  React.useEffect(() => {
    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges]);
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Handle node position updates and deletions
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNode(change.id, { position: change.position });
        }
        if (change.type === "select") {
          const nodeId = change.selected ? change.id : null;
          selectNode(nodeId);
          onNodeSelect(nodeId);
        }
        if (change.type === "remove") {
          deleteNode(change.id);
        }
      });
      onNodesChange(changes);
    },
    [updateNode, selectNode, onNodeSelect, deleteNode, onNodesChange]
  );
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Vérifier que les nœuds existent
        const sourceNode = storeNodes.find((n) => n.id === connection.source);
        const targetNode = storeNodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return;

        // Empêcher l'auto-connexion
        if (connection.source === connection.target) {
          alert("Un nœud ne peut pas se connecter à lui-même !");
          return;
        }

        // Empêcher les connexions cycliques
        const wouldCreateCycle = (
          parentId: string,
          childId: string
        ): boolean => {
          const parent = storeNodes.find((n) => n.id === parentId);
          if (!parent) return false;
          if (parent.parent_id === childId) return true;
          if (parent.parent_id)
            return wouldCreateCycle(parent.parent_id, childId);
          return false;
        };
        // Déterminer qui sera parent/enfant basé sur l'ordre
        // Le nœud avec l'ordre le plus HAUT devient enfant du nœud avec l'ordre le plus BAS
        const childNode =
          sourceNode.order > targetNode.order ? sourceNode : targetNode;
        const parentNode =
          sourceNode.order > targetNode.order ? targetNode : sourceNode;

        if (wouldCreateCycle(parentNode.id, childNode.id)) {
          alert("Cette connexion créerait une boucle cyclique !");
          return;
        }

        // Vérifier si l'enfant a déjà un parent
        const hasExistingConnection = tabMode
          ? (() => {
              const activeTab = multiTabStore.getActiveTab();
              const connections = activeTab?.connections || [];
              return connections.some((conn) => conn.target === childNode.id);
            })()
          : childNode.parent_id;

        if (hasExistingConnection) {
          const confirmReplace = confirm(
            `"${
              childNode.label_json?.fr || childNode.key
            }" a déjà un parent. Voulez-vous remplacer cette connexion ?`
          );
          if (!confirmReplace) return;
        }

        // Show dialog to enter condition for the connection
        setConnectionDialog({
          isOpen: true,
          connection,
        });
        setCondition("");
      }
    },
    [storeNodes, tabMode, multiTabStore]
  );
  const handleConfirmConnection = useCallback(() => {
    const { connection } = connectionDialog;
    if (connection?.source && connection?.target) {
      // Trouver les nœuds pour comparer leurs ordres
      const sourceNode = storeNodes.find((n) => n.id === connection.source);
      const targetNode = storeNodes.find((n) => n.id === connection.target);
      if (sourceNode && targetNode) {
        // Le nœud avec l'ordre le plus HAUT devient l'enfant du nœud avec l'ordre le plus BAS
        const isSourceChild = sourceNode.order > targetNode.order;
        const parentId = isSourceChild ? targetNode.id : sourceNode.id;
        const childId = isSourceChild ? sourceNode.id : targetNode.id;

        if (tabMode) {
          // Multi-tab mode: create NodeConnection
          multiTabStore.addConnectionToActiveTab({
            source: parentId,
            target: childId,
            condition: condition || undefined,
          });
        } else {
          // Single-tab mode: update node parent_id
          singleTabStore.connectNodes(
            parentId,
            childId,
            condition || undefined
          );
        }
      }
    }
    setConnectionDialog({ isOpen: false, connection: null });
    setCondition("");
  }, [
    connectionDialog,
    condition,
    storeNodes,
    tabMode,
    multiTabStore,
    singleTabStore,
  ]);

  const handleCancelConnection = useCallback(() => {
    setConnectionDialog({ isOpen: false, connection: null });
    setCondition("");
  }, []);

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    onNodeSelect(null);
  }, [selectNode, onNodeSelect]);
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        deleteKeyCode={["Delete", "Backspace"]}
        colorMode={
          theme === "dark" ? "dark" : theme === "light" ? "light" : "system"
        }
      >
        <Background gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return "#3b82f6";
            return "#6b7280";
          }}
        />
      </ReactFlow>
      {/* Connection condition dialog */}
      <Dialog
        open={connectionDialog.isOpen}
        onOpenChange={handleCancelConnection}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condition de connexion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {connectionDialog.connection &&
              (() => {
                const sourceNode = storeNodes.find(
                  (n) => n.id === connectionDialog.connection?.source
                );
                const targetNode = storeNodes.find(
                  (n) => n.id === connectionDialog.connection?.target
                );
                if (sourceNode && targetNode) {
                  // Le nœud avec l'ordre le plus HAUT devient enfant du nœud avec l'ordre le plus BAS
                  const childNode =
                    sourceNode.order > targetNode.order
                      ? sourceNode
                      : targetNode;
                  const parentNode =
                    sourceNode.order > targetNode.order
                      ? targetNode
                      : sourceNode;

                  return (
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="text-sm">
                        <strong>
                          &quot;{childNode.label_json?.fr || childNode.key}
                          &quot;
                        </strong>{" "}
                        (ordre {childNode.order})
                        <br />
                        deviendra enfant de
                        <br />
                        <strong>
                          &quot;{parentNode.label_json?.fr || parentNode.key}
                          &quot;
                        </strong>{" "}
                        (ordre {parentNode.order})
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

            <div>
              <Label htmlFor="condition">
                Condition JSON-Logic (optionnel)
              </Label>
              <Textarea
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder='ex: {"==": [{"var": "type"}, "advanced"]}'
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Laissez vide pour une connexion sans condition. La condition
                détermine quand ce champ enfant sera affiché.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelConnection}>
                Annuler
              </Button>
              <Button onClick={handleConfirmConnection}>Confirmer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
