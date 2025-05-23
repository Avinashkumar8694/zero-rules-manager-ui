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
}