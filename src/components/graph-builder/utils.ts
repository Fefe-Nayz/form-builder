import { Node, XYPosition, Position } from '@xyflow/react';

interface HandleBounds {
  source?: Array<{
    id: string;
    position: Position;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  target?: Array<{
    id: string;
    position: Position;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface NodeWithHandles extends Node {
  internals?: {
    handleBounds?: HandleBounds;
  };
  handleBounds?: HandleBounds;
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getParams(nodeA: Node, nodeB: Node): [XYPosition, XYPosition, Position, Position] {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let positionA: Position, positionB: Position;

  if (horizontalDiff > verticalDiff) {
    positionA = centerA.x > centerB.x ? Position.Left : Position.Right;
    positionB = centerA.x > centerB.x ? Position.Right : Position.Left;
  } else {
    positionA = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    positionB = centerA.y > centerB.y ? Position.Bottom : Position.Top;
  }

  const [sourceX, sourceY] = getHandleCoordsByPosition(nodeA, positionA);
  const [targetX, targetY] = getHandleCoordsByPosition(nodeB, positionB);

  return [
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
    positionA,
    positionB,
  ];
}

function getNodeCenter(node: Node): XYPosition {
  return {
    x: node.position.x + (node.measured?.width || node.width || 200) / 2,
    y: node.position.y + (node.measured?.height || node.height || 100) / 2,
  };
}

// returns the position of the handle
function getHandleCoordsByPosition(node: Node, handlePosition: Position): [number, number] {
  // Try to access handle bounds from different possible locations
  const nodeWithHandles = node as NodeWithHandles;
  const handleBounds = nodeWithHandles.internals?.handleBounds || nodeWithHandles.handleBounds;
  const handle = handleBounds?.source?.find(
    (h: { id: string; position: Position; x: number; y: number; width: number; height: number }) => h.position === handlePosition
  );

  if (!handle) {
    // Fallback to edge of node if handle not found
    const nodeWidth = node.measured?.width || node.width || 200;
    const nodeHeight = node.measured?.height || node.height || 100;
    
    let x = node.position.x;
    let y = node.position.y;
    
    switch (handlePosition) {
      case Position.Left:
        x = node.position.x;
        y = node.position.y + nodeHeight / 2;
        break;
      case Position.Right:
        x = node.position.x + nodeWidth;
        y = node.position.y + nodeHeight / 2;
        break;
      case Position.Top:
        x = node.position.x + nodeWidth / 2;
        y = node.position.y;
        break;
      case Position.Bottom:
        x = node.position.x + nodeWidth / 2;
        y = node.position.y + nodeHeight;
        break;
    }
    
    return [x, y];
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.position.x + handle.x + offsetX;
  const y = node.position.y + handle.y + offsetY;

  return [x, y];
}

export function getEdgeParams(source: Node, target: Node) {
  const [sourcePosition, targetPosition, sourcePos, targetPos] = getParams(source, target);

  return {
    sourceX: sourcePosition.x,
    sourceY: sourcePosition.y,
    targetX: targetPosition.x,
    targetY: targetPosition.y,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
  };
} 