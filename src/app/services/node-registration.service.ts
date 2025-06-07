import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map } from 'rxjs';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
declare global {
  interface Window {
    registerNode: (config: any) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NodeRegistrationService {
  private registeredNodes: Map<string, any> = new Map();
  private nodeUrls: string[] = [
    `${environment.apiBaseUrl}/nodes/html/files/FileIn`,
    `${environment.apiBaseUrl}/nodes/html/files/excel`,
    `${environment.apiBaseUrl}/nodes/html/files/start`,
  ];
  constructor(private http: HttpClient) {
    // Initialize global registerNode function
    window.registerNode = this.registerNode.bind(this);
    this.initializeNodeRegistration();
    this.registerSampleNodes(); // Add sample nodes for testing
    console.log('NodeRegistrationService initialized');
  }

  /**
   * Initialize node registration by loading all node definitions
   */
  private initializeNodeRegistration(): void {
    this.loadNodeDefinitions(this.nodeUrls).subscribe(
      () => console.log('All nodes loaded successfully'),
      error => console.error('Error loading nodes:', error)
    );
  }

  /**
   * Loads a node definition HTML file and injects it into the DOM
   * @param nodePath Path to the node HTML file
   */
  loadNodeDefinition(nodePath: string): Observable<void> {
    return this.http.get(nodePath, { responseType: 'text' }).pipe(
      map(html => {
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = html;

        // Extract and inject scripts
        const scripts = container.getElementsByTagName('script');
        Array.from(scripts).forEach(script => {
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = script.textContent;
          document.body.appendChild(newScript);
        });
      })
    );
  }

  /**
   * Registers a node definition
   * @param config Node configuration object
   */
  private registerNode(config: any): void {
    if (!config.type) {
      throw new Error('Node type is required');
    }

    // Extract template from DOM before scripts are processed
    const templateScript = document.querySelector(`script[type="text/html"][data-template-name="${config.type}"]`);
    if (templateScript) {
      config.template = templateScript.innerHTML;
    }

    this.registeredNodes.set(config.type, config);
    console.log(`Node ${config.type} registered successfully`);
  }

  /**
   * Gets a registered node definition
   * @param type Type of the node to retrieve
   */
  getNodeDefinition(type: string): any {
    return this.registeredNodes.get(type);
  }

  /**
   * Gets all registered node definitions
   */
  getAllNodeDefinitions(): Map<string, any> {
    return this.registeredNodes;
  }

  /**
   * Loads multiple node definitions
   * @param nodePaths Array of paths to node HTML files
   */
  loadNodeDefinitions(nodePaths: string[]): Observable<void[]> {
    const loadObservables = nodePaths.map(path => this.loadNodeDefinition(path));
    return forkJoin(loadObservables);
  }

  /**
   * Registers sample nodes for testing the palette
   */
  private registerSampleNodes(): void {
    const sampleNodes:any = [
      // {
      //   type: 'start',
      //   label: 'Start',
      //   icon: 'play_arrow',
      //   description: 'Start node for workflow',
      //   appearance: {
      //     category: 'Flow Control',
      //     color: '#4CAF50',
      //     icon: 'play_arrow'
      //   },
      //   io: {
      //     inputs: 0,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'page',
      //   label: 'Page',
      //   icon: 'add_box',
      //   description: 'Page component',
      //   appearance: {
      //     category: 'UI Components',
      //     color: '#2196F3',
      //     icon: 'add_box'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'decision',
      //   label: 'Decision',
      //   icon: 'alt_route',
      //   description: 'Decision logic node',
      //   appearance: {
      //     category: 'Logic',
      //     color: '#FF9800',
      //     icon: 'alt_route'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 2
      //   }
      // },
      // {
      //   type: 'process',
      //   label: 'Process',
      //   icon: 'settings',
      //   description: 'Data processing node',
      //   appearance: {
      //     category: 'Processing',
      //     color: '#9C27B0',
      //     icon: 'settings'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'query',
      //   label: 'Query',
      //   icon: 'search',
      //   description: 'Database query node',
      //   appearance: {
      //     category: 'Data',
      //     color: '#607D8B',
      //     icon: 'search'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'model',
      //   label: 'Model',
      //   icon: 'storage',
      //   description: 'Data model node',
      //   appearance: {
      //     category: 'Data',
      //     color: '#795548',
      //     icon: 'storage'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'notify',
      //   label: 'Notify',
      //   icon: 'notifications',
      //   description: 'Notification node',
      //   appearance: {
      //     category: 'Communication',
      //     color: '#F44336',
      //     icon: 'notifications'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'pdf',
      //   label: 'PDF',
      //   icon: 'picture_as_pdf',
      //   description: 'PDF generation node',
      //   appearance: {
      //     category: 'Output',
      //     color: '#E91E63',
      //     icon: 'picture_as_pdf'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'network',
      //   label: 'Network',
      //   icon: 'share',
      //   description: 'Network operation node',
      //   appearance: {
      //     category: 'Communication',
      //     color: '#00BCD4',
      //     icon: 'share'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // },
      // {
      //   type: 'workflow',
      //   label: 'Workflow',
      //   icon: 'account_tree',
      //   description: 'Sub-workflow node',
      //   appearance: {
      //     category: 'Flow Control',
      //     color: '#673AB7',
      //     icon: 'account_tree'
      //   },
      //   io: {
      //     inputs: 1,
      //     outputs: 1
      //   }
      // }
    ];

    sampleNodes.forEach((node:any) => {
      this.registeredNodes.set(node.type, node);
    });

    console.log(`Registered ${sampleNodes.length} sample nodes`);
  }
}