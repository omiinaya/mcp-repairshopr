/**
 * Query understanding module for RepairShopr API documentation
 *
 * This module provides intelligent query analysis including intent detection,
 * entity extraction, query expansion, synonym handling, disambiguation, and
 * classification to improve search results.
 */

import { ApiEndpoint, ApiParameter } from '../utils/types';
import { MetadataIndex } from '../parser/metadata';

/**
 * Query intent types
 */
export type QueryIntent = 'search' | 'lookup' | 'list' | 'compare' | 'validate';

/**
 * Query classification types
 */
export type QueryType = 
  | 'resource_query' 
  | 'endpoint_query' 
  | 'parameter_query' 
  | 'permission_query' 
  | 'general_query';

/**
 * Extracted entities from a query
 */
export interface QueryEntities {
  /** Identified resources (e.g., "Customer", "Ticket") */
  resources: string[];
  /** Identified methods/operations (e.g., "get", "create", "update") */
  methods: string[];
  /** Identified parameters (e.g., "id", "status", "name") */
  parameters: string[];
  /** Identified permissions (e.g., "view_customer", "edit_ticket") */
  permissions: string[];
  /** Identified HTTP methods (e.g., "GET", "POST") */
  httpMethods: string[];
}

/**
 * Complete query analysis result
 */
export interface QueryAnalysis {
  /** Original query string */
  originalQuery: string;
  /** Detected intent */
  intent: QueryIntent;
  /** Extracted entities */
  entities: QueryEntities;
  /** Query classification */
  queryType: QueryType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Suggested improvements */
  suggestions: string[];
}

/**
 * Disambiguation result for resolving query ambiguities
 */
export interface DisambiguationResult {
  /** Whether disambiguation was needed */
  needsDisambiguation: boolean;
  /** Ambiguous terms found */
  ambiguousTerms: string[];
  /** Possible interpretations */
  interpretations: Array<{
    interpretation: string;
    entities: QueryEntities;
    confidence: number;
  }>;
  /** Recommended interpretation */
  recommendedInterpretation?: {
    interpretation: string;
    entities: QueryEntities;
    confidence: number;
  };
}

/**
 * Common API term mappings for entity extraction
 */
const API_TERM_MAPPINGS: Record<string, { type: keyof QueryEntities; value: string }> = {
  // Resource mappings
  'customer': { type: 'resources', value: 'Customer' },
  'customers': { type: 'resources', value: 'Customer' },
  'ticket': { type: 'resources', value: 'Ticket' },
  'tickets': { type: 'resources', value: 'Ticket' },
  'invoice': { type: 'resources', value: 'Invoice' },
  'invoices': { type: 'resources', value: 'Invoice' },
  'estimate': { type: 'resources', value: 'Estimate' },
  'estimates': { type: 'resources', value: 'Estimate' },
  'lead': { type: 'resources', value: 'Lead' },
  'leads': { type: 'resources', value: 'Lead' },
  'contact': { type: 'resources', value: 'Contact' },
  'contacts': { type: 'resources', value: 'Contact' },
  'vendor': { type: 'resources', value: 'Vendor' },
  'vendors': { type: 'resources', value: 'Vendor' },
  'product': { type: 'resources', value: 'Product' },
  'products': { type: 'resources', value: 'Product' },
  'item': { type: 'resources', value: 'Item' },
  'items': { type: 'resources', value: 'Item' },
  'payment': { type: 'resources', value: 'Payment' },
  'payments': { type: 'resources', value: 'Payment' },
  'appointment': { type: 'resources', value: 'Appointment' },
  'appointments': { type: 'resources', value: 'Appointment' },
  'user': { type: 'resources', value: 'User' },
  'users': { type: 'resources', value: 'User' },
  'asset': { type: 'resources', value: 'Asset' },
  'assets': { type: 'resources', value: 'Asset' },
  'contract': { type: 'resources', value: 'Contract' },
  'contracts': { type: 'resources', value: 'Contract' },
  'schedule': { type: 'resources', value: 'Schedule' },
  'wiki': { type: 'resources', value: 'WikiPage' },
  'timelog': { type: 'resources', value: 'Timelog' },
  'call': { type: 'resources', value: 'Call' },
  'phone': { type: 'resources', value: 'Phone' },
  'setting': { type: 'resources', value: 'Setting' },
  
  // Method/operation mappings
  'get': { type: 'methods', value: 'get' },
  'create': { type: 'methods', value: 'create' },
  'add': { type: 'methods', value: 'create' },
  'new': { type: 'methods', value: 'create' },
  'update': { type: 'methods', value: 'update' },
  'edit': { type: 'methods', value: 'update' },
  'modify': { type: 'methods', value: 'update' },
  'change': { type: 'methods', value: 'update' },
  'delete': { type: 'methods', value: 'delete' },
  'remove': { type: 'methods', value: 'delete' },
  'list': { type: 'methods', value: 'list' },
  'show': { type: 'methods', value: 'list' },
  'find': { type: 'methods', value: 'search' },
  'search': { type: 'methods', value: 'search' },
  'lookup': { type: 'methods', value: 'lookup' },
  'compare': { type: 'methods', value: 'compare' },
  'validate': { type: 'methods', value: 'validate' },
  'check': { type: 'methods', value: 'validate' },
  
  // HTTP method mappings
  'GET': { type: 'httpMethods', value: 'GET' },
  'POST': { type: 'httpMethods', value: 'POST' },
  'PUT': { type: 'httpMethods', value: 'PUT' },
  'PATCH': { type: 'httpMethods', value: 'PATCH' },
  'DELETE': { type: 'httpMethods', value: 'DELETE' },
  
  // Common parameter mappings
  'id': { type: 'parameters', value: 'id' },
  'name': { type: 'parameters', value: 'name' },
  'status': { type: 'parameters', value: 'status' },
  'email': { type: 'parameters', value: 'email' },
  'address': { type: 'parameters', value: 'address' },
  'date': { type: 'parameters', value: 'date' },
  'time': { type: 'parameters', value: 'time' },
  'limit': { type: 'parameters', value: 'limit' },
  'offset': { type: 'parameters', value: 'offset' },
  'page': { type: 'parameters', value: 'page' },
  'sort': { type: 'parameters', value: 'sort' },
  'filter': { type: 'parameters', value: 'filter' },
  'query': { type: 'parameters', value: 'query' },
};

/**
 * Synonym mappings for query expansion
 */
const SYNONYM_MAPPINGS: Record<string, string[]> = {
  'get': ['retrieve', 'fetch', 'obtain', 'show', 'display'],
  'create': ['add', 'new', 'make', 'generate', 'establish'],
  'update': ['edit', 'modify', 'change', 'alter', 'revise'],
  'delete': ['remove', 'erase', 'destroy', 'eliminate'],
  'list': ['show', 'display', 'enumerate', 'index'],
  'search': ['find', 'lookup', 'query', 'seek', 'explore'],
  'customer': ['client', 'account', 'patron'],
  'ticket': ['issue', 'request', 'case', 'problem'],
  'invoice': ['bill', 'statement', 'charge'],
  'estimate': ['quote', 'proposal', 'bid'],
  'lead': ['prospect', 'potential', 'opportunity'],
  'contact': ['person', 'individual', 'connection'],
  'vendor': ['supplier', 'provider', 'seller'],
  'product': ['item', 'good', 'merchandise'],
  'payment': ['transaction', 'charge', 'fee'],
  'appointment': ['meeting', 'schedule', 'booking'],
  'user': ['member', 'account', 'profile'],
  'asset': ['equipment', 'device', 'hardware'],
  'contract': ['agreement', 'deal', 'arrangement'],
};

/**
 * Query understanding class for analyzing and processing user queries
 */
export class QueryUnderstanding {
  private metadataIndex: MetadataIndex | null = null;
  private knownResources: Set<string> = new Set();
  private knownParameters: Set<string> = new Set();
  private knownPermissions: Set<string> = new Set();

  /**
   * Initialize the query understanding module with metadata index
   */
  constructor(metadataIndex?: MetadataIndex) {
    if (metadataIndex) {
      this.setMetadataIndex(metadataIndex);
    }
  }

  /**
   * Set or update the metadata index
   */
  setMetadataIndex(index: MetadataIndex): void {
    this.metadataIndex = index;
    this.buildKnownEntities();
  }

  /**
   * Build sets of known entities from metadata index
   */
  private buildKnownEntities(): void {
    if (!this.metadataIndex) return;

    // Build known resources
    this.metadataIndex.resources.forEach((_, resourceName) => {
      this.knownResources.add(resourceName);
      this.knownResources.add(resourceName.toLowerCase());
    });

    // Build known parameters
    const allParams = this.getAllParameters();
    allParams.forEach(param => {
      this.knownParameters.add(param.name);
      this.knownParameters.add(param.name.toLowerCase());
    });

    // Build known permissions
    this.metadataIndex.endpointsByPermission.forEach((_, permission) => {
      this.knownPermissions.add(permission);
      this.knownPermissions.add(permission.toLowerCase());
    });
  }

  /**
   * Get all parameters from metadata index
   */
  private getAllParameters(): ApiParameter[] {
    if (!this.metadataIndex) return [];
    const parameters: ApiParameter[] = [];
    for (const endpoint of this.metadataIndex.allEndpoints) {
      parameters.push(...endpoint.parameters);
      if (endpoint.requestBody) {
        parameters.push(...endpoint.requestBody);
      }
    }
    return parameters;
  }

  /**
   * Analyze query intent and extract entities
   */
  analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = query.toLowerCase().trim();
    const entities = this.extractEntities(query);
    const intent = this.detectIntent(normalizedQuery, entities);
    const queryType = this.classifyQuery(query, entities);
    const confidence = this.calculateConfidence(normalizedQuery, entities, intent);
    const suggestions = this.generateSuggestions(normalizedQuery, entities, intent);

    return {
      originalQuery: query,
      intent,
      entities,
      queryType,
      confidence,
      suggestions
    };
  }

  /**
   * Extract resources, methods, parameters from query
   */
  extractEntities(query: string): QueryEntities {
    const entities: QueryEntities = {
      resources: [],
      methods: [],
      parameters: [],
      permissions: [],
      httpMethods: []
    };

    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);

    // Extract entities using term mappings
    for (const word of words) {
      const mapping = API_TERM_MAPPINGS[word];
      if (mapping) {
        const { type, value } = mapping;
        if (!entities[type].includes(value)) {
          entities[type].push(value);
        }
      }
    }

    // Extract known resources from metadata
    for (const resource of this.knownResources) {
      if (normalizedQuery.includes(resource.toLowerCase())) {
        const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
        if (!entities.resources.includes(capitalized)) {
          entities.resources.push(capitalized);
        }
      }
    }

    // Extract known parameters from metadata
    for (const param of this.knownParameters) {
      if (normalizedQuery.includes(param.toLowerCase()) && 
          !API_TERM_MAPPINGS[param]) {
        if (!entities.parameters.includes(param)) {
          entities.parameters.push(param);
        }
      }
    }

    // Extract known permissions from metadata
    for (const permission of this.knownPermissions) {
      if (normalizedQuery.includes(permission.toLowerCase())) {
        if (!entities.permissions.includes(permission)) {
          entities.permissions.push(permission);
        }
      }
    }

    return entities;
  }

  /**
   * Generate expanded queries based on entities
   */
  expandQuery(query: string, entities: QueryEntities): string[] {
    const expandedQueries: string[] = [query];
    const words = query.toLowerCase().split(/\s+/);

    // Expand with resource variations
    for (const resource of entities.resources) {
      const resourceLower = resource.toLowerCase();
      if (!words.includes(resourceLower)) {
        expandedQueries.push(`${resource} ${query}`);
      }
      // Add singular/plural variations
      if (resourceLower.endsWith('s')) {
        const singular = resourceLower.slice(0, -1);
        expandedQueries.push(query.replace(resourceLower, singular));
      } else {
        const plural = resourceLower + 's';
        expandedQueries.push(query.replace(resourceLower, plural));
      }
    }

    // Expand with method variations
    for (const method of entities.methods) {
      const methodLower = method.toLowerCase();
      if (!words.includes(methodLower)) {
        expandedQueries.push(`${method} ${query}`);
      }
    }

    // Expand with HTTP method variations
    for (const httpMethod of entities.httpMethods) {
      if (!words.includes(httpMethod.toLowerCase())) {
        expandedQueries.push(`${httpMethod} ${query}`);
      }
    }

    // Remove duplicates while preserving order
    return Array.from(new Set(expandedQueries));
  }

  /**
   * Generate synonym variations for the query
   */
  handleSynonyms(query: string): string[] {
    const synonymQueries: string[] = [query];
    const words = query.toLowerCase().split(/\s+/);

    for (const word of words) {
      const synonyms = SYNONYM_MAPPINGS[word];
      if (synonyms && synonyms.length > 0) {
        for (const synonym of synonyms) {
          const newQuery = query.replace(new RegExp(word, 'gi'), synonym);
          if (newQuery !== query) {
            synonymQueries.push(newQuery);
          }
        }
      }
    }

    // Remove duplicates while preserving order
    return Array.from(new Set(synonymQueries));
  }

  /**
   * Resolve query ambiguities
   */
  disambiguateQuery(query: string, entities: QueryEntities): DisambiguationResult {
    const ambiguousTerms: string[] = [];
    const interpretations: Array<{
      interpretation: string;
      entities: QueryEntities;
      confidence: number;
    }> = [];

    // Check for ambiguous terms
    const normalizedQuery = query.toLowerCase();
    
    // Check for ambiguous resource names
    if (entities.resources.length > 1) {
      ambiguousTerms.push(...entities.resources);
      
      // Generate interpretations for each resource
      for (const resource of entities.resources) {
        const interpretationEntities: QueryEntities = {
          resources: [resource],
          methods: [...entities.methods],
          parameters: [...entities.parameters],
          permissions: [...entities.permissions],
          httpMethods: [...entities.httpMethods]
        };
        
        interpretations.push({
          interpretation: `Focus on ${resource}`,
          entities: interpretationEntities,
          confidence: this.calculateConfidence(normalizedQuery, interpretationEntities, 'search')
        });
      }
    }

    // Check for ambiguous methods
    if (entities.methods.length > 1) {
      ambiguousTerms.push(...entities.methods);
      
      // Generate interpretations for each method
      for (const method of entities.methods) {
        const interpretationEntities: QueryEntities = {
          resources: [...entities.resources],
          methods: [method],
          parameters: [...entities.parameters],
          permissions: [...entities.permissions],
          httpMethods: [...entities.httpMethods]
        };
        
        interpretations.push({
          interpretation: `Use ${method} operation`,
          entities: interpretationEntities,
          confidence: this.calculateConfidence(normalizedQuery, interpretationEntities, 'search')
        });
      }
    }

    // Check for ambiguous HTTP methods
    if (entities.httpMethods.length > 1) {
      ambiguousTerms.push(...entities.httpMethods);
    }

    const needsDisambiguation = ambiguousTerms.length > 0;
    
    // Find recommended interpretation (highest confidence)
    let recommendedInterpretation;
    if (interpretations.length > 0) {
      recommendedInterpretation = interpretations.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    }

    return {
      needsDisambiguation,
      ambiguousTerms,
      interpretations,
      recommendedInterpretation
    };
  }

  /**
   * Classify query type
   */
  classifyQuery(query: string, entities: QueryEntities): QueryType {
    const normalizedQuery = query.toLowerCase();

    // Check for permission query
    if (entities.permissions.length > 0 || 
        normalizedQuery.includes('permission') ||
        normalizedQuery.includes('access') ||
        normalizedQuery.includes('authorize')) {
      return 'permission_query';
    }

    // Check for parameter query
    if (entities.parameters.length > 0 ||
        normalizedQuery.includes('parameter') ||
        normalizedQuery.includes('param') ||
        normalizedQuery.includes('field') ||
        normalizedQuery.includes('attribute')) {
      return 'parameter_query';
    }

    // Check for endpoint query
    if (entities.httpMethods.length > 0 ||
        normalizedQuery.includes('endpoint') ||
        normalizedQuery.includes('api') ||
        normalizedQuery.includes('route') ||
        normalizedQuery.includes('path')) {
      return 'endpoint_query';
    }

    // Check for resource query
    if (entities.resources.length > 0) {
      return 'resource_query';
    }

    // Default to general query
    return 'general_query';
  }

  /**
   * Detect query intent
   */
  private detectIntent(query: string, entities: QueryEntities): QueryIntent {
    const normalizedQuery = query.toLowerCase();

    // Check for compare intent
    if (normalizedQuery.includes('compare') ||
        normalizedQuery.includes('difference') ||
        normalizedQuery.includes('versus') ||
        normalizedQuery.includes('vs')) {
      return 'compare';
    }

    // Check for validate intent
    if (normalizedQuery.includes('validate') ||
        normalizedQuery.includes('check') ||
        normalizedQuery.includes('verify') ||
        normalizedQuery.includes('confirm')) {
      return 'validate';
    }

    // Check for list intent
    if (normalizedQuery.includes('list') ||
        normalizedQuery.includes('all') ||
        normalizedQuery.includes('show') ||
        normalizedQuery.includes('display') ||
        normalizedQuery.includes('enumerate')) {
      return 'list';
    }

    // Check for lookup intent
    if (normalizedQuery.includes('lookup') ||
        normalizedQuery.includes('find') ||
        normalizedQuery.includes('get') ||
        normalizedQuery.includes('retrieve') ||
        entities.httpMethods.includes('GET')) {
      return 'lookup';
    }

    // Default to search intent
    return 'search';
  }

  /**
   * Calculate confidence score for query analysis
   */
  private calculateConfidence(
    query: string,
    entities: QueryEntities,
    intent: QueryIntent
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on entity count
    const entityCount = 
      entities.resources.length +
      entities.methods.length +
      entities.parameters.length +
      entities.permissions.length +
      entities.httpMethods.length;
    
    confidence += Math.min(entityCount * 0.1, 0.3);

    // Increase confidence if query contains known entities
    const knownEntityCount = 
      entities.resources.filter(r => this.knownResources.has(r.toLowerCase())).length +
      entities.parameters.filter(p => this.knownParameters.has(p.toLowerCase())).length +
      entities.permissions.filter(p => this.knownPermissions.has(p.toLowerCase())).length;
    
    confidence += Math.min(knownEntityCount * 0.1, 0.2);

    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate suggestions for improving the query
   */
  private generateSuggestions(
    query: string,
    entities: QueryEntities,
    intent: QueryIntent
  ): string[] {
    const suggestions: string[] = [];

    // Suggest adding resource if missing
    if (entities.resources.length === 0) {
      suggestions.push('Consider specifying a resource (e.g., customer, ticket, invoice)');
    }

    // Suggest adding method if missing
    if (entities.methods.length === 0 && entities.httpMethods.length === 0) {
      suggestions.push('Consider specifying an operation (e.g., get, create, update, delete)');
    }

    // Suggest adding HTTP method for endpoint queries
    if (intent === 'lookup' && entities.httpMethods.length === 0) {
      suggestions.push('Consider adding an HTTP method (e.g., GET, POST, PUT, DELETE)');
    }

    // Suggest using synonyms for better results
    const synonymVariations = this.handleSynonyms(query);
    if (synonymVariations.length > 1) {
      suggestions.push('Try using alternative terms or synonyms for better results');
    }

    return suggestions;
  }

  /**
   * Get all known resources
   */
  getKnownResources(): string[] {
    return Array.from(this.knownResources);
  }

  /**
   * Get all known parameters
   */
  getKnownParameters(): string[] {
    return Array.from(this.knownParameters);
  }

  /**
   * Get all known permissions
   */
  getKnownPermissions(): string[] {
    return Array.from(this.knownPermissions);
  }
}
