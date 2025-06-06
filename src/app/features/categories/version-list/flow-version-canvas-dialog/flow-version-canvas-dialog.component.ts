import { Component,
  ElementRef,
  ViewChild,
  Inject,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeWindowComponent } from '../../../nodes/components/attribute-window/attribute-window.component';
import { AttributeWindowComponent as ConnectionAttributeWindow } from './attribute-window/attribute-window.component';
import { CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-flow-version-canvas-dialog',
  templateUrl: './flow-version-canvas-dialog.component.html',
  styleUrls: ['./flow-version-canvas-dialog.component.scss'],
  standalone: false,
})
export class FlowVersionCanvasDialogComponent implements AfterViewInit {
  @ViewChild('canvasBoundary', { static: true }) canvasBoundary!: ElementRef;

  scale = 1;
  dragOffset = { x: 0, y: 0 };
  canvasMinWidth = 2000; // default canvas width
  canvasMinHeight = 2000;
  showNodesList = true; // Initialize to true to show palette by default
  selectedNodes: Set<string> = new Set(); // Track selected nodes

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

  registeredNodes: any[] = [];

    private pathUpdateScheduled = false;
  private pathCache = new Map<string, string>();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FlowVersionCanvasDialogComponent>,
    private nodeRegistrationService: NodeRegistrationService,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    const nodes = this.nodeRegistrationService.getAllNodeDefinitions();
    this.registeredNodes = Array.from(nodes.values());
    this.initializeNodes();
    this.updateConnectionPaths();
  }

  ngAfterViewInit(): void {
    // Run updateConnectionPaths after Angular has completed initial rendering
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      setTimeout(() => {
        // Force position recalculation
        Object.entries(this.nodes).forEach(([nodeId, node]) => {
          if (node.position) {
            // Temporarily offset position to force recalculation
            const originalPos = { ...node.position };
            node.position = {
              x: originalPos.x + 0.1,
              y: originalPos.y + 0.1
            };
            
            // Schedule revert and path update
            requestAnimationFrame(() => {
              this.updateConnectionPaths();
              node.position = originalPos;
              this.cdr.detectChanges();
              
              // One more update to ensure connections are correct
              requestAnimationFrame(() => {
                this.updateConnectionPaths();
                this.cdr.detectChanges();
              });
            });
          }
        });
      }, 100); // Small delay to ensure DOM is ready
    });
    this.updateConnectionPaths();
  }
  toggleNodesList() {
    this.showNodesList = !this.showNodesList;
    // Force layout recalculation
    this.ngZone.run(() => {
      setTimeout(() => {
        this.updateConnectionPaths();
        this.cdr.detectChanges();
      });
    });
  }

  onNodeDrop(event: CdkDragDrop<any, any, any>): void {
    const canvasRect = this.canvasBoundary.nativeElement.getBoundingClientRect();
    const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
    const nodeConfig = event.item?.data;
    
    if (!nodeConfig) return;

    const nodeId = `node-${Date.now()}`;
    const position = {
      x: (event.dropPoint.x - canvasRect.left + scrollContainer.scrollLeft) / this.scale,
      y: (event.dropPoint.y - canvasRect.top + scrollContainer.scrollTop) / this.scale
    };

    this.nodes[nodeId] = {
      id: nodeId,
      type: nodeConfig.type,
      position: position,
      icon: nodeConfig.appearance?.icon,
      nodeStyle: nodeConfig.appearance?.nodeStyle,
      name: nodeConfig.label?.call(nodeConfig.defaults) || nodeConfig.type,
      color: nodeConfig.appearance?.color,
      config: nodeConfig
    };
  }
  
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

    if (!sourceOutputPoint.length || !targetInputPoint.length) return '';

    const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
    const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
    const canvasRect = canvasArea.getBoundingClientRect();

    try {
      const sourcePointRect = sourceOutputPoint[connection.source.outputIndex || 0].getBoundingClientRect();
      const targetPointRect = targetInputPoint[connection.target.inputIndex || 0].getBoundingClientRect();

      // If elements aren't properly sized yet, use node positions as fallback
      if (sourcePointRect.width === 0 || targetPointRect.width === 0) {
        const nodeWidth = 280; // Typical node width
        const nodeHeight = 40;  // Typical point vertical position

        // Calculate approximate connection points based on node positions
        const sourceX = sourceNode.position.x + nodeWidth;
        const sourceY = sourceNode.position.y + nodeHeight;
        const targetX = targetNode.position.x;
        const targetY = targetNode.position.y + nodeHeight;

        // Generate path
        return this.createPathFromPoints(sourceX, sourceY, targetX, targetY);
      }

      // Get center points of the connection points
      const sourceCenterX = (sourcePointRect.left + sourcePointRect.right) / 2;
      const sourceCenterY = (sourcePointRect.top + sourcePointRect.bottom) / 2;
      const targetCenterX = (targetPointRect.left + targetPointRect.right) / 2;
      const targetCenterY = (targetPointRect.top + targetPointRect.bottom) / 2;

      // Calculate positions relative to canvas
      const sourceX = (sourceCenterX - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const sourceY = (sourceCenterY - canvasRect.top + scrollContainer.scrollTop) / this.scale;
      const targetX = (targetCenterX - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const targetY = (targetCenterY - canvasRect.top + scrollContainer.scrollTop) / this.scale;

      if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
        return '';
      }

      const path = this.createPathFromPoints(sourceX, sourceY, targetX, targetY);
      this.pathCache.set(cacheKey, path);
      return path;
    } catch (error) {
      console.error('Error calculating connection path:', error);
      return '';
    }
  }

  private createPathFromPoints(sourceX: number, sourceY: number, targetX: number, targetY: number): string {
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    
    // Calculate control points for bezier curve
    const controlPoint1X = sourceX + (deltaX * 0.25);
    const controlPoint1Y = sourceY + (deltaY * 0.5);
    const controlPoint2X = sourceX + (deltaX * 0.75);
    const controlPoint2Y = sourceY + (deltaY * 0.5);
    
    return `M ${sourceX} ${sourceY} C ${sourceX} ${controlPoint1Y}, ${targetX} ${controlPoint2Y}, ${targetX} ${targetY}`;
  }

  private updateConnectionPaths() {
    if (this.pathUpdateScheduled) return;
    this.pathUpdateScheduled = true;

    // Clear path cache when scale changes to ensure proper recalculation
    this.pathCache.clear();
    
    requestAnimationFrame(() => {
      this.connections.forEach(connection => {
        // Force recalculation of paths when scale changes
        const path = this.calculateConnectionPath(connection);
        if (path) {
          connection.path = path;
        }
        this.getConnectionMidpoint(connection);
      });
      this.pathUpdateScheduled = false;
    });
  }
  

  private initializeNodes() {
    if (this.data?.flowConfig) {
      // Initialize nodes first with complete configuration
      if (this.data.flowConfig.nodes) {
        this.nodes = Object.entries(this.data.flowConfig.nodes).reduce((acc, [nodeId, node]: [string, any]) => {
          const nodeConfig = this.nodeRegistrationService.getNodeDefinition(node.type);
          acc[node.id] = {
            icon: nodeConfig?.appearance?.icon,
            nodeStyle: nodeConfig?.appearance?.nodeStyle,
            name: nodeConfig?.label?.call(nodeConfig.defaults) || node.type,
            color: nodeConfig?.appearance?.color,
            ...node, // Keep original node data including positions if they exist
            config: nodeConfig
          };
          return acc;
        }, {} as any);

        // Calculate positions only for nodes without positions
        const nodesWithoutPosition = Object.entries(this.nodes).filter(([_, node]) => !node.position);
        
        if (nodesWithoutPosition.length > 0) {
          const nodeSpacing = { x: 300, y: 150 };
          const startPosition = { x: 100, y: 100 };
          const maxNodesPerRow = 2;

          const nodesByLevel: { [key: string]: any[] } = {};
          let currentLevel = 0;
          let currentNodes = nodesWithoutPosition;

          while (currentNodes.length > 0) {
            nodesByLevel[currentLevel] = currentNodes.slice(0, maxNodesPerRow);
            currentNodes = currentNodes.slice(maxNodesPerRow);
            currentLevel++;
          }

          Object.entries(nodesByLevel).forEach(([level, nodes]) => {
            const levelY = startPosition.y + (parseInt(level) * nodeSpacing.y);
            const totalWidth = (nodes.length - 1) * nodeSpacing.x;
            const startX = startPosition.x + (1000 - totalWidth) / 2;

            nodes.forEach(([nodeId, node], index) => {
              const xPos = startX + (index * nodeSpacing.x);
              this.nodes[nodeId].position = { x: xPos, y: levelY };
            });
          });

          const maxY = startPosition.y + (currentLevel * nodeSpacing.y) + nodeSpacing.y;
          this.canvasMinHeight = Math.max(this.canvasMinHeight, maxY);
        }
      }

      // Initialize connections after nodes are fully set up
      if (this.data.flowConfig.connections) {
        this.connections = this.data.flowConfig.connections.map((conn: any) => ({
          source: { nodeId: conn.from.node, outputIndex: conn?.from?.port || 0 },
          target: { nodeId: conn.to.node, inputIndex: conn.to?.port || 0 },
          condition: conn.condition,
          name: conn.name
        }));
      }
    }
  }

  zoomIn() {
    this.scale = Math.min(1, this.scale + 0.1);
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
  }

  getConnectionMidpoint(connection: any) {
    if (!connection.path) return null;
    const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
      const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
      const canvasRect = canvasArea.getBoundingClientRect();
    
    // Parse the SVG path to get coordinates
    const pathCommands = connection.path.split(' ');
    if (pathCommands.length < 8) return null;
    
    // Get source and target points
    const sourceX = (parseFloat(pathCommands[1]) );
    const sourceY = (parseFloat(pathCommands[2]) );
    const targetX = (parseFloat(pathCommands[pathCommands.length - 2]));
    const targetY = (parseFloat(pathCommands[pathCommands.length - 1]));
    
    // Calculate midpoint
    return {
      x: ((sourceX + targetX) / 2) / this.scale,
      y: ((sourceY + targetY) / 2) / this.scale
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

    

    const buffer = 500;
    const nodeRight = localX + 300;
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

      const sourceX = (rect.x - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const sourceY = (rect.y - canvasRect.top + scrollContainer.scrollTop) / this.scale;

      this.draggedConnection = {
        source: { nodeId, outputIndex: index },
        sourcePoint: { x: rect.x +5 , y: rect.y +5},
        currentPoint: { x: sourceX, y: sourceY }
      };

      console.log('dragging connection', this.draggedConnection, point);

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

      // Calculate preview path using the same logic as calculateConnectionPath
      const sourceX = (this.draggedConnection.sourcePoint.x - canvasRect.left + scrollContainer.scrollLeft) / this.scale;
      const sourceY = (this.draggedConnection.sourcePoint.y - canvasRect.top + scrollContainer.scrollTop) / this.scale;
      const deltaX = currentX - sourceX;
      const deltaY = currentY - sourceY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Adjust control point distances based on the connection length
      const controlPointOffset = Math.min(distance * 0.5, 100);
      
      // Calculate control points maintaining curve shape across different scales
      const controlPoint1X = sourceX + (deltaX * 0.25);
      const controlPoint1Y = sourceY + (deltaY * 0.5);
      const controlPoint2X = sourceX + (deltaX * 0.75);
      const controlPoint2Y = sourceY + (deltaY * 0.5);

      this.previewPath = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${currentX} ${currentY}`;
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
    const flowConfig = {
      nodes: this.nodes,
      connections: this.connections.map(conn => ({
        from: {
          node: conn.source.nodeId,
          port: conn.source.outputIndex
        },
        to: {
          node: conn.target.nodeId,
          port: conn.target.inputIndex
        },
        condition: conn.condition,
        name: conn.name
      }))
    };

    console.log('Saving flow config:', flowConfig);
    // Close dialog with the updated config
    this.dialogRef.close({ flowConfig });
  }

  onClose() {
    this.dialogRef.close();
  }

  refreshCanvas(): void {
    // Logic to refresh the canvas
    this.nodes = {}; // Clear all nodes
    this.connections = []; // Clear all connections
    this.updateConnectionPaths(); // Recalculate paths
    console.log('Canvas refreshed');
  }

  toggleFullScreen(): void {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  }

  openSettings(): void {
    // Logic to open settings dialog
    console.log('Settings dialog opened');
  }

  selectNode(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    if (!event.ctrlKey && !event.metaKey) {
      this.selectedNodes.clear();
    }
    this.selectedNodes.add(nodeId);
    this.cdr.detectChanges();
  }

  clearSelection() {
    this.selectedNodes.clear();
    this.cdr.detectChanges();
  }

  deleteSelectedNodes() {
    // Remove associated connections first
    this.connections = this.connections.filter(conn => 
      !this.selectedNodes.has(conn.source.nodeId) && !this.selectedNodes.has(conn.target.nodeId)
    );

    // Remove selected nodes
    this.selectedNodes.forEach(nodeId => {
      delete this.nodes[nodeId];
    });

    this.selectedNodes.clear();
    this.updateConnectionPaths();
    this.cdr.detectChanges();
  }
}
