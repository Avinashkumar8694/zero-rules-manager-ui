import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  AfterViewInit
} from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeWindowComponent } from '../../../nodes/components/attribute-window/attribute-window.component';
import { CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { AttributeWindowComponent as ConnectionAttributeWindow } from './attribute-window/attribute-window.component';

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
    condition?: string;
    name?: string;
  }> = [];

  // Connection dragging state
  isDraggingConnection = false;
  draggedConnection: {
    source: { nodeId: string; outputIndex: number };
    sourcePoint: { x: number; y: number };
    currentPoint: { x: number; y: number };
  } | null = null;
  previewPath: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FlowVersionCanvasDialogComponent>,
    private nodeRegistrationService: NodeRegistrationService,
    private dialog: MatDialog
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
          target: { nodeId: conn.to.node, inputIndex: conn.to?.port || 0 },
          condition: conn.condition,
          name: conn.name
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

  getConnectionMidpoint(connection: any) {
    if (!connection.path) return null;
    
    // Parse the SVG path to get coordinates
    const pathCommands = connection.path.split(' ');
    if (pathCommands.length < 8) return null;
    
    // Get source and target points
    const sourceX = parseFloat(pathCommands[1]);
    const sourceY = parseFloat(pathCommands[2]);
    const targetX = parseFloat(pathCommands[pathCommands.length - 2]);
    const targetY = parseFloat(pathCommands[pathCommands.length - 1]);
    
    // Calculate midpoint
    return {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    };
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


  onConnectionPointMouseDown(event: MouseEvent, nodeId: string, index: number, type: 'input' | 'output') {
    if (type === 'output') {
      event.stopPropagation();
      this.isDraggingConnection = true;

      const point = event.target as HTMLElement;
      const rect = point.getBoundingClientRect();
      const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
      const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
      const canvasRect = canvasArea.getBoundingClientRect();

      const sourceX = (rect.x + 5 - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const sourceY = (rect.y + 5 - canvasRect.top + scrollContainer.scrollTop) / this.scale;

      this.draggedConnection = {
        source: { nodeId, outputIndex: index },
        sourcePoint: { x: sourceX, y: sourceY },
        currentPoint: { x: sourceX, y: sourceY }
      };

      // Add mousemove and mouseup listeners to the document
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    }
  }

  onConnectionPointMouseUp(event: MouseEvent, nodeId: string, index: number, type: 'input' | 'output') {
    if (this.isDraggingConnection && type === 'input' && this.draggedConnection) {
      event.stopPropagation();
      
      // Create new connection
      const newConnection = {
        source: this.draggedConnection.source,
        target: { nodeId, inputIndex: index }
      };

      // Check if connection already exists or is self-connecting
      const connectionExists = this.connections.some(conn =>
        conn.source.nodeId === newConnection.source.nodeId &&
        conn.source.outputIndex === newConnection.source.outputIndex &&
        conn.target.nodeId === newConnection.target.nodeId &&
        conn.target.inputIndex === newConnection.target.inputIndex
      );

      const isSelfConnection = newConnection.source.nodeId === newConnection.target.nodeId;
      const isValidConnection = !connectionExists && !isSelfConnection;

      if (isValidConnection) {
        // Remove any existing connections to this input
        const existingInputConnection = this.connections.findIndex(conn =>
          conn.target.nodeId === newConnection.target.nodeId &&
          conn.target.inputIndex === newConnection.target.inputIndex
        );

        // if (existingInputConnection !== -1) {
        //   this.connections.splice(existingInputConnection, 1);
        // }

        // Add new connection and update paths
        this.connections.push(newConnection);
        requestAnimationFrame(() => {
          this.updateConnectionPaths();
        });
      }

      // Reset dragging state
      this.isDraggingConnection = false;
      this.draggedConnection = null;
      this.previewPath = '';
      
      // Remove document listeners
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDraggingConnection && this.draggedConnection) {
      const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
      const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
      const canvasRect = canvasArea.getBoundingClientRect();

      const currentX = (event.clientX - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const currentY = (event.clientY - canvasRect.top + scrollContainer.scrollTop) / this.scale;

      this.draggedConnection.currentPoint = { x: currentX, y: currentY };

      // Calculate preview path
      const sourceX = this.draggedConnection.sourcePoint.x;
      const sourceY = this.draggedConnection.sourcePoint.y;
      const deltaY = Math.abs(currentY - sourceY);
      const controlPoint1Y = sourceY + (deltaY * 0.5);
      const controlPoint2Y = currentY - (deltaY * 0.5);

      this.previewPath = `M ${sourceX} ${sourceY} C ${sourceX} ${controlPoint1Y}, ${currentX} ${controlPoint2Y}, ${currentX} ${currentY}`;
    }
  }

  private onMouseUp = () => {
    this.isDraggingConnection = false;
    this.draggedConnection = null;
    this.previewPath = '';

    // Remove document listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onNodeRightClick(event: MouseEvent, node: any) {
    event.preventDefault();
    const nodeConfig = this.nodeRegistrationService.getNodeDefinition(node.type);
    if (nodeConfig) {
      this.dialog.open(AttributeWindowComponent, {
        width: '400px',
        height: '100vh',
        position: { right: '0' },
        data: { selectedNode: node }
      });
    }
  }

  onConnectionRightClick(event: MouseEvent, connection: any) {
    event.preventDefault();
    this.dialog.open(ConnectionAttributeWindow, {
      width: '400px',
      data: { selectedNode: connection }
    });
  }

  saveCanvas() {
    console.log('Saving canvas...', this.nodes);
  }

  onClose() {
    this.dialogRef.close();
  }
}
