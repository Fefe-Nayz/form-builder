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
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import "@xyflow/react/dist/style.css";
import { AlertCircle } from "lucide-react";

import ParamNodeComponent from "./ParamNodeComponent";
import FloatingEdge from "./FloatingEdge";
import SmartEdge from "./SmartEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { ParamNode } from "@/types/graph-builder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const nodeTypes = {
  paramNode: ParamNodeComponent,
};

const edgeTypes = {
  floating: FloatingEdge,
  smart: SmartEdge,
};

interface GraphCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  tabMode?: boolean;
}

// Internal component that uses useReactFlow hook
function GraphCanvasInternal({
  onNodeSelect,
  tabMode = false,
}: GraphCanvasProps) {
  const { theme } = useTheme();
  const reactFlowInstance = useReactFlow();
  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  // Use appropriate store based on mode with useMemo to avoid dependency issues
  const storeNodes = useMemo(() => {
    if (tabMode) {
      const activeTab = multiTabStore.getActiveTab();
      return activeTab?.nodes || [];
    }
    return singleTabStore.nodes;
  }, [
    tabMode,
    multiTabStore.tabs,
    multiTabStore.activeTabId,
    singleTabStore.nodes,
  ]);

  const storeConnections = useMemo(() => {
    if (!tabMode) return [];
    const activeTab = multiTabStore.getActiveTab();
    return activeTab?.connections || [];
  }, [tabMode, multiTabStore.tabs, multiTabStore.activeTabId]);

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
    if (tabMode) {
      const activeTab = multiTabStore.getActiveTab();
      return activeTab?.selectedNodeId || null;
    }
    return singleTabStore.selectedNodeId;
  }, [
    tabMode,
    multiTabStore.tabs,
    multiTabStore.activeTabId,
    singleTabStore.selectedNodeId,
  ]);

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

  const [replaceDialog, setReplaceDialog] = useState<{
    isOpen: boolean;
    connection: Connection | null;
    childNodeName: string;
  }>({
    isOpen: false,
    connection: null,
    childNodeName: "",
  });

  const [cycleDialog, setCycleDialog] = useState<{
    isOpen: boolean;
    connection: Connection | null;
    childNodeName: string;
    parentNodeName: string;
    conflictingConnections: Array<{
      id: string;
      sourceLabel: string;
      targetLabel: string;
    }>;
  }>({
    isOpen: false,
    connection: null,
    childNodeName: "",
    parentNodeName: "",
    conflictingConnections: [],
  });

  const [condition, setCondition] = useState("");
  const [copiedNodes, setCopiedNodes] = useState<ParamNode[]>([]);
  const lastClickTimeRef = React.useRef(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
        type: "smart",
        animated: true,
        data: {
          condition: connection.condition,
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
          type: "smart",
          animated: true,
          data: {
            condition: node.condition,
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
      try {
        // Handle node position updates and deletions
        changes.forEach((change) => {
          if (change.type === "position" && change.position) {
            updateNode(change.id, { position: change.position });
          }
          if (change.type === "remove") {
            deleteNode(change.id);
          }
        });
        onNodesChange(changes);
      } catch (error) {
        console.error("Error in handleNodesChange:", error);
      }
    },
    [updateNode, deleteNode, onNodesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      try {
        if (
          connection.source &&
          connection.target &&
          connection.sourceHandle &&
          connection.targetHandle
        ) {
          // Vérifier que les nœuds existent
          const sourceNode = storeNodes.find((n) => n.id === connection.source);
          const targetNode = storeNodes.find((n) => n.id === connection.target);

          if (!sourceNode || !targetNode) return;

          // Empêcher l'auto-connexion
          if (connection.source === connection.target) {
            toast.error("Un nœud ne peut pas se connecter à lui-même !");
            return;
          }

          // Déterminer qui sera parent/enfant basé sur l'ordre
          // Le nœud avec l'ordre le plus HAUT devient enfant du nœud avec l'ordre le plus BAS
          const childNode =
            sourceNode.order > targetNode.order ? sourceNode : targetNode;
          const parentNode =
            sourceNode.order > targetNode.order ? targetNode : sourceNode;

          // Empêcher les connexions cycliques - version améliorée
          const wouldCreateCycle = (
            proposedParentId: string,
            proposedChildId: string
          ): boolean => {
            // Build adjacency map of current connections
            const adjacencyMap = new Map<string, Set<string>>();

            if (tabMode) {
              // Tab mode: use connections array
              const activeTab = multiTabStore.getActiveTab();
              const connections = activeTab?.connections || [];

              connections.forEach((conn) => {
                if (!adjacencyMap.has(conn.source)) {
                  adjacencyMap.set(conn.source, new Set());
                }
                adjacencyMap.get(conn.source)!.add(conn.target);
              });
            } else {
              // Single-tab mode: use parent_id relationships
              storeNodes.forEach((node) => {
                if (node.parent_id) {
                  if (!adjacencyMap.has(node.parent_id)) {
                    adjacencyMap.set(node.parent_id, new Set());
                  }
                  adjacencyMap.get(node.parent_id)!.add(node.id);
                }
              });
            }

            // Add the proposed connection to the adjacency map
            if (!adjacencyMap.has(proposedParentId)) {
              adjacencyMap.set(proposedParentId, new Set());
            }
            adjacencyMap.get(proposedParentId)!.add(proposedChildId);

            // Perform DFS cycle detection starting from the proposed parent
            const visited = new Set<string>();
            const recursionStack = new Set<string>();

            const hasCycleDFS = (nodeId: string): boolean => {
              if (recursionStack.has(nodeId)) {
                return true; // Back edge found, cycle detected
              }

              if (visited.has(nodeId)) {
                return false; // Already visited and no cycle from this path
              }

              visited.add(nodeId);
              recursionStack.add(nodeId);

              const children = adjacencyMap.get(nodeId) || new Set();
              for (const childId of children) {
                if (hasCycleDFS(childId)) {
                  return true;
                }
              }

              recursionStack.delete(nodeId);
              return false;
            };

            // Check for cycles starting from all nodes (to catch disconnected cycles)
            for (const nodeId of adjacencyMap.keys()) {
              if (!visited.has(nodeId)) {
                if (hasCycleDFS(nodeId)) {
                  return true;
                }
              }
            }

            return false;
          };

          const findConflictingConnections = (
            proposedParentId: string,
            proposedChildId: string
          ): Array<{
            id: string;
            sourceLabel: string;
            targetLabel: string;
          }> => {
            const conflicting: Array<{
              id: string;
              sourceLabel: string;
              targetLabel: string;
            }> = [];

            if (tabMode) {
              const activeTab = multiTabStore.getActiveTab();
              const connections = activeTab?.connections || [];

              // Find path from proposed child back to proposed parent
              const adjacencyMap = new Map<string, Set<string>>();
              const connectionMap = new Map<
                string,
                { id: string; target: string }
              >();

              connections.forEach((conn) => {
                if (!adjacencyMap.has(conn.source)) {
                  adjacencyMap.set(conn.source, new Set());
                }
                adjacencyMap.get(conn.source)!.add(conn.target);
                connectionMap.set(`${conn.source}-${conn.target}`, {
                  id: conn.id,
                  target: conn.target,
                });
              });

              // Find path using DFS
              const visited = new Set<string>();
              const path: string[] = [];

              const findPath = (
                currentId: string,
                targetId: string
              ): boolean => {
                if (currentId === targetId) {
                  return true;
                }

                if (visited.has(currentId)) {
                  return false;
                }

                visited.add(currentId);
                path.push(currentId);

                const children = adjacencyMap.get(currentId) || new Set();
                for (const childId of children) {
                  if (findPath(childId, targetId)) {
                    return true;
                  }
                }

                path.pop();
                return false;
              };

              if (findPath(proposedChildId, proposedParentId)) {
                // Convert path to connections
                for (let i = 0; i < path.length - 1; i++) {
                  const connKey = `${path[i]}-${path[i + 1]}`;
                  const connInfo = connectionMap.get(connKey);
                  if (connInfo) {
                    const sourceNode = storeNodes.find((n) => n.id === path[i]);
                    const targetNode = storeNodes.find(
                      (n) => n.id === path[i + 1]
                    );

                    conflicting.push({
                      id: connInfo.id,
                      sourceLabel:
                        sourceNode?.label_json?.fr ||
                        sourceNode?.key ||
                        path[i],
                      targetLabel:
                        targetNode?.label_json?.fr ||
                        targetNode?.key ||
                        path[i + 1],
                    });
                  }
                }
              }
            } else {
              // Single-tab mode: find parent-child chain
              let currentNodeId = proposedChildId;
              const visited = new Set<string>();

              while (currentNodeId && !visited.has(currentNodeId)) {
                visited.add(currentNodeId);
                const currentNode = storeNodes.find(
                  (n) => n.id === currentNodeId
                );

                if (currentNode?.parent_id) {
                  if (currentNode.parent_id === proposedParentId) {
                    // Found the cycle
                    const parentNode = storeNodes.find(
                      (n) => n.id === currentNode.parent_id
                    );
                    conflicting.push({
                      id: `parent-${currentNodeId}`,
                      sourceLabel:
                        parentNode?.label_json?.fr ||
                        parentNode?.key ||
                        currentNode.parent_id,
                      targetLabel:
                        currentNode.label_json?.fr ||
                        currentNode.key ||
                        currentNodeId,
                    });
                    break;
                  }
                  currentNodeId = currentNode.parent_id;
                } else {
                  break;
                }
              }
            }

            return conflicting;
          };

          if (wouldCreateCycle(parentNode.id, childNode.id)) {
            // Find conflicting connections that create the cycle
            const conflictingConnections = findConflictingConnections(
              parentNode.id,
              childNode.id
            );

            // Show cycle detection dialog
            setCycleDialog({
              isOpen: true,
              connection,
              childNodeName: childNode.label_json?.fr || childNode.key,
              parentNodeName: parentNode.label_json?.fr || parentNode.key,
              conflictingConnections,
            });
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
            // Show replace confirmation dialog instead of window.confirm
            setReplaceDialog({
              isOpen: true,
              connection,
              childNodeName: childNode.label_json?.fr || childNode.key,
            });
            return;
          }

          // Show dialog to enter condition for the connection
          setConnectionDialog({
            isOpen: true,
            connection,
          });
          setCondition("");
        }
      } catch (error) {
        console.error("Error in handleConnect:", error);
        toast.error("Erreur lors de la connexion des nœuds");
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
            condition:
              condition && typeof condition === "string"
                ? condition.trim() || undefined
                : undefined,
          });
        } else {
          // Single-tab mode: update node parent_id
          singleTabStore.connectNodes(
            parentId,
            childId,
            condition && typeof condition === "string"
              ? condition.trim() || undefined
              : undefined
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

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      try {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastClickTimeRef.current;

        // Clear any existing timeout
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }

        // Check for double-click (within 300ms)
        if (timeDiff < 300) {
          // This is a double-click
          console.log("Double-click detected, creating node...");
          event.preventDefault();
          event.stopPropagation();

          try {
            // Check if reactFlowInstance is available
            if (!reactFlowInstance?.screenToFlowPosition) {
              console.error("ReactFlow instance not available");
              toast.error("Erreur: ReactFlow non disponible");
              return;
            }

            // Calculate the position in flow coordinates
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            console.log("Creating node at position:", position);

            // Create a new node at the clicked position
            const maxOrder =
              storeNodes.length > 0
                ? Math.max(...storeNodes.map((n) => n.order))
                : 0;

            const newNode = {
              key: `node_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              label_json: {
                fr: "Nouveau nœud",
                en: "New node",
              },
              type_id: 3, // Default to string type
              order: maxOrder + 1,
              position: {
                x: Math.round(position.x),
                y: Math.round(position.y),
              },
              parent_id: undefined,
              condition: undefined,
              help_json: undefined,
              meta_json: undefined,
            };

            if (tabMode) {
              const nodeId = multiTabStore.addNodeToActiveTab(newNode);
              if (nodeId) {
                console.log("Node created in tab mode:", nodeId);
                toast.success("Nouveau nœud créé par double-clic");
              } else {
                console.error("Failed to create node in tab mode");
                toast.error("Erreur lors de la création du nœud");
              }
            } else {
              const nodeId = singleTabStore.addNode(newNode);
              if (nodeId) {
                console.log("Node created in single mode:", nodeId);
                toast.success("Nouveau nœud créé par double-clic");
              } else {
                console.error("Failed to create node in single mode");
                toast.error("Erreur lors de la création du nœud");
              }
            }
          } catch (error) {
            console.error("Error creating node:", error);
            toast.error("Erreur lors de la création du nœud");
          }
        } else {
          // This might be a single click, wait to see if a second click comes
          clickTimeoutRef.current = setTimeout(() => {
            // This was definitely a single click
            selectNode(null);
            onNodeSelect(null);
            clickTimeoutRef.current = null;
          }, 300);
        }

        // Update the last click time
        lastClickTimeRef.current = currentTime;
      } catch (error) {
        console.error("Error in handlePaneClick:", error);
      }
    },
    [
      selectNode,
      onNodeSelect,
      storeNodes,
      tabMode,
      multiTabStore,
      singleTabStore,
      reactFlowInstance,
    ]
  );

  // Handle selection changes including multi-select
  const handleSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      try {
        // Only update our single selection state for single node selections
        // Let ReactFlow handle multi-select natively without interference
        if (params.nodes.length === 1) {
          const selectedNodeId = params.nodes[0].id;
          const currentSelectedNodeId = tabMode
            ? multiTabStore.getActiveTab()?.selectedNodeId || null
            : singleTabStore.selectedNodeId;

          // Only update if the selection actually changed
          if (selectedNodeId !== currentSelectedNodeId) {
            selectNode(selectedNodeId);
            onNodeSelect(selectedNodeId);
          }
        } else if (params.nodes.length === 0) {
          // Only clear selection when no nodes are selected
          const currentSelectedNodeId = tabMode
            ? multiTabStore.getActiveTab()?.selectedNodeId || null
            : singleTabStore.selectedNodeId;

          if (currentSelectedNodeId !== null) {
            selectNode(null);
            onNodeSelect(null);
          }
        }
        // For multiple nodes (length > 1), don't interfere with ReactFlow's multi-select
        // Just let it handle the selection naturally
      } catch (error) {
        console.error("Error in handleSelectionChange:", error);
      }
    },
    [selectNode, onNodeSelect, tabMode, multiTabStore, singleTabStore]
  );

  // Connection validation function
  const isValidConnection = useCallback((connection: Connection | Edge) => {
    // Ensure we have all required connection properties
    if (!connection.source || !connection.target) {
      return false;
    }

    // Prevent self-connection
    if (connection.source === connection.target) {
      return false;
    }

    // Allow all valid connections since each handle is bidirectional
    return true;
  }, []);

  const handleConfirmReplace = useCallback(() => {
    const { connection } = replaceDialog;
    if (connection) {
      // Proceed with the connection
      setConnectionDialog({
        isOpen: true,
        connection,
      });
      setCondition("");
    }
    setReplaceDialog({ isOpen: false, connection: null, childNodeName: "" });
  }, [replaceDialog]);

  const handleCancelReplace = useCallback(() => {
    setReplaceDialog({ isOpen: false, connection: null, childNodeName: "" });
  }, []);

  const handleCancelCycle = useCallback(() => {
    setCycleDialog({
      isOpen: false,
      connection: null,
      childNodeName: "",
      parentNodeName: "",
      conflictingConnections: [],
    });
  }, []);

  const handleConfirmCycle = useCallback(() => {
    const { connection, conflictingConnections } = cycleDialog;
    if (connection && conflictingConnections.length > 0) {
      // Remove conflicting connections
      if (tabMode) {
        conflictingConnections.forEach((conflicting) => {
          multiTabStore.deleteConnectionFromActiveTab(conflicting.id);
        });
      } else {
        // For single-tab mode, remove parent_id relationships
        conflictingConnections.forEach((conflicting) => {
          const nodeId = conflicting.id.replace("parent-", "");
          singleTabStore.updateNode(nodeId, {
            parent_id: undefined,
            condition: undefined,
          });
        });
      }

      toast.success(
        `${conflictingConnections.length} connexion(s) conflictuelle(s) supprimée(s)`
      );

      // Now proceed with the original connection
      setConnectionDialog({
        isOpen: true,
        connection,
      });
      setCondition("");
    }

    setCycleDialog({
      isOpen: false,
      connection: null,
      childNodeName: "",
      parentNodeName: "",
      conflictingConnections: [],
    });
  }, [cycleDialog, tabMode, multiTabStore, singleTabStore]);

  // Default edge styling - blue for connected edges
  const defaultEdgeOptions = {
    style: {
      stroke: "#3b82f6", // blue color
      strokeWidth: 2,
    },
  };

  // Add keyboard event handler for copy-paste
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "c" || event.key === "C") {
          // Copy selected nodes
          const selectedNodes = reactFlowNodes.filter((node) => node.selected);
          if (selectedNodes.length > 0) {
            const nodesToCopy = selectedNodes
              .map((node) => {
                const originalNode = storeNodes.find((n) => n.id === node.id);
                return originalNode;
              })
              .filter(Boolean) as ParamNode[];

            setCopiedNodes(nodesToCopy);
            toast.success(`${nodesToCopy.length} nœud(s) copié(s)`);
          }
          event.preventDefault();
        } else if (event.key === "v" || event.key === "V") {
          // Paste copied nodes
          if (copiedNodes.length > 0) {
            const maxOrder =
              storeNodes.length > 0
                ? Math.max(...storeNodes.map((n) => n.order))
                : 0;

            copiedNodes.forEach((node, index) => {
              const newNode = {
                ...node,
                // Generate new unique key and remove id to force new ID generation
                key: `${node.key}_copy_${Date.now()}_${index}`,
                position: {
                  x: node.position.x + 50 + index * 20,
                  y: node.position.y + 50 + index * 20,
                },
                order: maxOrder + index + 1,
                parent_id: undefined, // Remove parent relationships for now
                condition: undefined,
              };

              // Remove the id field to force generation of a new ID
              delete (newNode as any).id;

              if (tabMode) {
                multiTabStore.addNodeToActiveTab(newNode);
              } else {
                singleTabStore.addNode(newNode);
              }
            });

            toast.success(`${copiedNodes.length} nœud(s) collé(s)`);
          }
          event.preventDefault();
        }
      }
    },
    [
      reactFlowNodes,
      storeNodes,
      copiedNodes,
      tabMode,
      multiTabStore,
      singleTabStore,
    ]
  );

  // Add event listener for keyboard events
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={isValidConnection}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        selectionKeyCode={"Shift"}
        panOnDrag={[1, 2]}
        selectionOnDrag
        colorMode={
          theme === "dark" ? "dark" : theme === "light" ? "light" : "system"
        }
        connectionLineComponent={FloatingConnectionLine}
        defaultEdgeOptions={defaultEdgeOptions}
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

      {/* Replace connection confirmation dialog */}
      <AlertDialog
        open={replaceDialog.isOpen}
        onOpenChange={handleCancelReplace}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remplacer la connexion existante
            </AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{replaceDialog.childNodeName}&quot; a déjà un parent.
              Voulez-vous remplacer cette connexion ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Remplacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cycle detection dialog */}
      <AlertDialog open={cycleDialog.isOpen} onOpenChange={handleCancelCycle}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Boucle cyclique détectée</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Connecter &quot;<strong>{cycleDialog.childNodeName}</strong>
                  &quot; à &quot;<strong>{cycleDialog.parentNodeName}</strong>
                  &quot; créerait une boucle cyclique dans le graphe.
                </p>

                {cycleDialog.conflictingConnections.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">
                      Connexions en conflit qui seront supprimées :
                    </p>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-muted">
                      {cycleDialog.conflictingConnections.map((conn, index) => (
                        <div key={conn.id} className="text-sm py-1">
                          {index + 1}. &quot;<strong>{conn.sourceLabel}</strong>
                          &quot; → &quot;<strong>{conn.targetLabel}</strong>
                          &quot;
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Voulez-vous supprimer{" "}
                  {cycleDialog.conflictingConnections.length > 1
                    ? "ces connexions"
                    : "cette connexion"}
                  et procéder à la nouvelle connexion ?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCycle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer et connecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Main wrapper component with ReactFlowProvider
export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInternal {...props} />
    </ReactFlowProvider>
  );
}
