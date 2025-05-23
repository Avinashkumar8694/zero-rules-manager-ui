import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  AfterViewInit
} from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-flow-version-canvas-dialog',
  templateUrl: './flow-version-canvas-dialog.component.html',
  styleUrls: ['./flow-version-canvas-dialog.component.scss'],
  standalone: false
})
export class FlowVersionCanvasDialogComponent implements AfterViewInit {
  @ViewChild('canvasBoundary', { static: true }) canvasBoundary!: ElementRef;

  scale = 1;
  dragOffset = { x: 0, y: 0 };
  canvasMinWidth = 1000; // default canvas width
  canvasMinHeight = 1000;

  nodes: { [key: string]: any } = {};
  connections: Array<{
    source: { nodeId: string; outputIndex: number };
    target: { nodeId: string; inputIndex: number };
    path?: string;
  }> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FlowVersionCanvasDialogComponent>,
    private nodeRegistrationService: NodeRegistrationService
  ) {
    this.initializeNodes();
  }

  ngAfterViewInit(): void { }

  private pathUpdateScheduled = false;
  private pathCache = new Map<string, string>();

  private calculateConnectionPath(connection: any): string {
    const cacheKey = `${connection.source.nodeId}-${connection.source.outputIndex}-${connection.target.nodeId}-${connection.target.inputIndex}-${this.scale}`;
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey)!;
    }

    const sourceNode = this.nodes[connection.source.nodeId];
    const targetNode = this.nodes[connection.target.nodeId];

    if (!sourceNode?.position || !targetNode?.position) return '';

    const sourceElement = document.getElementById(sourceNode.id);
    const targetElement = document.getElementById(targetNode.id);

    if (!sourceElement || !targetElement) return '';

    const sourceOutputPoint = sourceElement.querySelectorAll('.connection-points.outputs .point');
    const targetInputPoint = targetElement.querySelectorAll('.connection-points.inputs .point');

    if (!sourceOutputPoint || !targetInputPoint) return '';

    const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
    const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
    const canvasRect = canvasArea.getBoundingClientRect();

    const sourcePointBoundingRect = sourceOutputPoint[connection.source.outputIndex || 0].getBoundingClientRect();
    const targetPointBoundingRect = targetInputPoint[connection.target.inputIndex || 0].getBoundingClientRect();

    // Calculate source and target points with scroll and scale adjustments
    const sourceX = (sourcePointBoundingRect.x +5 - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
    const sourceY = (sourcePointBoundingRect.y +5 - canvasRect.top + scrollContainer.scrollTop) / this.scale;
    const targetX = (targetPointBoundingRect.x +5 - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
    const targetY = (targetPointBoundingRect.y +5 - canvasRect.top + scrollContainer.scrollTop) / this.scale;

    // Calculate control points for bezier curve
    const deltaY = Math.abs(targetY - sourceY);
    const controlPoint1Y = sourceY + (deltaY * 0.5);
    const controlPoint2Y = targetY - (deltaY * 0.5);

    const path = `M ${sourceX} ${sourceY} C ${sourceX} ${controlPoint1Y}, ${targetX} ${controlPoint2Y}, ${targetX} ${targetY}`;
    this.pathCache.set(cacheKey, path);
    return path;
  }

  private updateConnectionPaths() {
    if (this.pathUpdateScheduled) return;
    this.pathUpdateScheduled = true;

    requestAnimationFrame(() => {
      this.pathCache.clear();
      this.connections.forEach(connection => {
        connection.path = this.calculateConnectionPath(connection);
      });
      this.pathUpdateScheduled = false;
    });
  }

  private initializeNodes() {
    if (this.data?.flowConfig) {
      // Initialize connections from flowConfig
      if (this.data.flowConfig.connections) {
        this.connections = this.data.flowConfig.connections.map((conn: any) => ({
          source: { nodeId: conn.from.node, outputIndex: conn?.from?.port || 0 },
          target: { nodeId: conn.to.node, inputIndex: conn.to?.port || 0 }
        }));
      }

      // Initialize nodes
      if (this.data.flowConfig.nodes) {
        // Apply node configurations from registration service
        this.nodes = Object.entries(this.data.flowConfig.nodes).reduce((acc, [nodeId, node]: [string, any]) => {
          const nodeConfig = this.nodeRegistrationService.getNodeDefinition(node.type);
          acc[node.id] = {
            icon: nodeConfig?.appearance?.icon,
            nodeStyle: nodeConfig?.appearance?.nodeStyle,
            name: nodeConfig?.label?.call(nodeConfig.defaults) || node.type,
            color: nodeConfig?.appearance?.color,
            ...node,
            config: nodeConfig
          };
          return acc;
        }, {} as any);

        // Calculate positions for nodes without positions
        const nodeSpacing = { x: 300, y: 150 }; // Spacing between nodes
        const startPosition = { x: 100, y: 100 }; // Initial position for first node
        const maxNodesPerRow = 2; // Maximum nodes in a row

        // Group nodes by their vertical level
        const nodesByLevel: { [key: string]: any[] } = {};
        let currentLevel = 0;

        // First pass: Collect nodes with existing positions
        const nodesWithPosition = Object.entries(this.nodes).filter(([_, node]) => node.position);
        const nodesWithoutPosition = Object.entries(this.nodes).filter(([_, node]) => !node.position);

        // Sort nodes without position into levels
        let currentNodes = nodesWithoutPosition;
        while (currentNodes.length > 0) {
          nodesByLevel[currentLevel] = currentNodes.slice(0, maxNodesPerRow);
          currentNodes = currentNodes.slice(maxNodesPerRow);
          currentLevel++;
        }

        // Position nodes level by level
        Object.entries(nodesByLevel).forEach(([level, nodes]) => {
          const levelY = startPosition.y + (parseInt(level) * nodeSpacing.y);
          const totalWidth = (nodes.length - 1) * nodeSpacing.x;
          const startX = startPosition.x + (1000 - totalWidth) / 2; // Center nodes horizontally

          nodes.forEach(([nodeId, node], index) => {
            const xPos = startX + (index * nodeSpacing.x);
            node.position = { x: xPos, y: levelY };
          });
        });

        // Update canvas dimensions
        const maxY = startPosition.y + (currentLevel * nodeSpacing.y) + nodeSpacing.y;
        this.canvasMinHeight = Math.max(this.canvasMinHeight, maxY);
      }
    }
  }

  zoomIn() {
    this.scale = Math.min(2, this.scale + 0.1);
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
  }

  onDragStart(event: CdkDragStart, nodeId: string) {
    const nodeElem = event.source.element.nativeElement as HTMLElement;
    const nodeRect = nodeElem.getBoundingClientRect();
    const pointerEvent = event.event as MouseEvent | PointerEvent;

    this.dragOffset = {
      x: (pointerEvent.clientX - nodeRect.left) / this.scale,
      y: (pointerEvent.clientY - nodeRect.top) / this.scale
    };
  }

  onNodeMoved(event: CdkDragMove, nodeId: string) {
    const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
    const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
    const canvasRect = canvasArea.getBoundingClientRect();

    const pointerX = event.pointerPosition.x;
    const pointerY = event.pointerPosition.y;

    const localX = (pointerX - canvasRect.left + scrollContainer.scrollLeft) / this.scale - this.dragOffset.x;
    const localY = (pointerY - canvasRect.top + scrollContainer.scrollTop) / this.scale - this.dragOffset.y;

    this.nodes[nodeId].position = { x: localX, y: localY };

    

    const buffer = 300;
    const nodeRight = localX + 120;
    const nodeBottom = localY + 80;

    // Dynamically increase minWidth and minHeight tracked by variables
    const requiredMinWidth = (nodeRight + buffer);
    if (requiredMinWidth > this.canvasMinWidth) {
      this.canvasMinWidth = requiredMinWidth;
    }

    const requiredMinHeight = (nodeBottom + buffer);
    if (requiredMinHeight > this.canvasMinHeight) {
      this.canvasMinHeight = requiredMinHeight;
    }

    // Auto-scroll logic (optional)
    const edge = 50;
    const scrollBounds = scrollContainer.getBoundingClientRect();

    if (pointerX > scrollBounds.right - edge) scrollContainer.scrollLeft += 20;
    else if (pointerX < scrollBounds.left + edge) scrollContainer.scrollLeft -= 20;

    if (pointerY > scrollBounds.bottom - edge) scrollContainer.scrollTop += 20;
    else if (pointerY < scrollBounds.top + edge) scrollContainer.scrollTop -= 20;

    // Update connection paths when nodes move
    this.updateConnectionPaths();
  }


  saveCanvas() {
    console.log('Saving canvas...', this.nodes);
  }

  onClose() {
    this.dialogRef.close();
  }
}
