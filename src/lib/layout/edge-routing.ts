import { Node, XYPosition } from '@xyflow/react';

interface PathFindingOptions {
  nodeSpacing: number;
  gridSize: number;
  avoidNodes: boolean;
}

interface GridCell {
  x: number;
  y: number;
  cost: number;
  parent?: GridCell;
  f: number;
  g: number;
  h: number;
}

export class EdgeRouter {
  private gridSize: number;
  private nodeSpacing: number;
  private grid: Map<string, GridCell>;
  private occupiedCells: Set<string>;

  constructor(options: Partial<PathFindingOptions> = {}) {
    this.gridSize = options.gridSize || 20;
    this.nodeSpacing = options.nodeSpacing || 100;
    this.grid = new Map();
    this.occupiedCells = new Set();
  }

  // Build a grid for A* pathfinding
  private buildGrid(
    sourcePos: XYPosition,
    targetPos: XYPosition,
    nodes: Node[]
  ): void {
    this.grid.clear();
    this.occupiedCells.clear();

    // Define bounding box with padding
    const minX = Math.min(sourcePos.x, targetPos.x) - 200;
    const maxX = Math.max(sourcePos.x, targetPos.x) + 200;
    const minY = Math.min(sourcePos.y, targetPos.y) - 200;
    const maxY = Math.max(sourcePos.y, targetPos.y) + 200;

    // Create grid cells
    for (let x = minX; x <= maxX; x += this.gridSize) {
      for (let y = minY; y <= maxY; y += this.gridSize) {
        const cellKey = `${x},${y}`;
        this.grid.set(cellKey, {
          x,
          y,
          cost: 1,
          f: 0,
          g: 0,
          h: 0,
        });
      }
    }

    // Mark cells occupied by nodes
    nodes.forEach((node) => {
      const nodeWidth = node.measured?.width || node.width || 200;
      const nodeHeight = node.measured?.height || node.height || 100;
      
      const nodeMinX = node.position.x - this.nodeSpacing / 2;
      const nodeMaxX = node.position.x + nodeWidth + this.nodeSpacing / 2;
      const nodeMinY = node.position.y - this.nodeSpacing / 2;
      const nodeMaxY = node.position.y + nodeHeight + this.nodeSpacing / 2;

      for (let x = nodeMinX; x <= nodeMaxX; x += this.gridSize) {
        for (let y = nodeMinY; y <= nodeMaxY; y += this.gridSize) {
          const cellKey = `${Math.round(x / this.gridSize) * this.gridSize},${Math.round(y / this.gridSize) * this.gridSize}`;
          this.occupiedCells.add(cellKey);
        }
      }
    });
  }

  // A* pathfinding algorithm
  public findPath(
    sourcePos: XYPosition,
    targetPos: XYPosition,
    nodes: Node[] = []
  ): XYPosition[] {
    this.buildGrid(sourcePos, targetPos, nodes);

    const startKey = this.snapToGrid(sourcePos);
    const endKey = this.snapToGrid(targetPos);

    const start = this.grid.get(startKey);
    const end = this.grid.get(endKey);

    if (!start || !end) {
      // Fallback to direct path
      return [sourcePos, targetPos];
    }

    const openSet: GridCell[] = [start];
    const closedSet = new Set<string>();

    start.g = 0;
    start.h = this.manhattan(start, end);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
      // Find cell with lowest f score
      let current = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      // Remove current from open set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);

      // Check if we've reached the target
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey) || this.occupiedCells.has(neighborKey)) {
          continue;
        }

        const tentativeG = current.g + this.manhattan(current, neighbor);

        const existingNeighbor = openSet.find(
          (cell) => cell.x === neighbor.x && cell.y === neighbor.y
        );

        if (!existingNeighbor) {
          neighbor.g = tentativeG;
          neighbor.h = this.manhattan(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < existingNeighbor.g) {
          existingNeighbor.g = tentativeG;
          existingNeighbor.f = existingNeighbor.g + existingNeighbor.h;
          existingNeighbor.parent = current;
        }
      }
    }

    // No path found, return direct line
    return [sourcePos, targetPos];
  }

  private snapToGrid(pos: XYPosition): string {
    const x = Math.round(pos.x / this.gridSize) * this.gridSize;
    const y = Math.round(pos.y / this.gridSize) * this.gridSize;
    return `${x},${y}`;
  }

  private manhattan(a: GridCell, b: GridCell): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions
    ];

    for (const [dx, dy] of directions) {
      const x = cell.x + dx * this.gridSize;
      const y = cell.y + dy * this.gridSize;
      const neighborKey = `${x},${y}`;
      const neighbor = this.grid.get(neighborKey);

      if (neighbor) {
        neighbors.push({ ...neighbor });
      }
    }

    return neighbors;
  }

  private reconstructPath(endCell: GridCell): XYPosition[] {
    const path: XYPosition[] = [];
    let current: GridCell | undefined = endCell;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    // Simplify path by removing unnecessary waypoints
    return this.simplifyPath(path);
  }

  private simplifyPath(path: XYPosition[]): XYPosition[] {
    if (path.length <= 2) return path;

    const simplified: XYPosition[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Check if current point is necessary (not on straight line)
      const isNecessary = 
        (prev.x !== next.x && prev.y !== next.y) ||
        (current.x !== prev.x && current.x !== next.x) ||
        (current.y !== prev.y && current.y !== next.y);

      if (isNecessary) {
        simplified.push(current);
      }
    }

    simplified.push(path[path.length - 1]);
    return simplified;
  }

  // Generate smooth path with rounded corners
  public generateSmoothPath(waypoints: XYPosition[], cornerRadius = 10): string {
    if (waypoints.length < 2) return '';

    let path = `M ${waypoints[0].x} ${waypoints[0].y}`;

    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const current = waypoints[i];
      const next = waypoints[i + 1];

      // Calculate rounded corner
      const d1 = Math.sqrt((current.x - prev.x) ** 2 + (current.y - prev.y) ** 2);
      const d2 = Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2);
      
      const r = Math.min(cornerRadius, d1 / 2, d2 / 2);
      
      if (r > 0) {
        const t1 = r / d1;
        const t2 = r / d2;
        
        const cp1x = current.x - t1 * (current.x - prev.x);
        const cp1y = current.y - t1 * (current.y - prev.y);
        
        const cp2x = current.x + t2 * (next.x - current.x);
        const cp2y = current.y + t2 * (next.y - current.y);
        
        path += ` L ${cp1x} ${cp1y}`;
        path += ` Q ${current.x} ${current.y} ${cp2x} ${cp2y}`;
      } else {
        path += ` L ${current.x} ${current.y}`;
      }
    }

    path += ` L ${waypoints[waypoints.length - 1].x} ${waypoints[waypoints.length - 1].y}`;
    return path;
  }
} 