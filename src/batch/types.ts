/**
 * Batch Processing Types (v3.4.0)
 * Phase 4 Task 9.4: Batch processing system
 */


/**
 * Batch job
 */
export interface BatchJob {
  /**
   * Job ID
   */
  id: string;

  /**
   * Job type
   */
  type: BatchJobType;

  /**
   * Job status
   */
  status: BatchJobStatus;

  /**
   * Job parameters
   */
  params: BatchJobParams;

  /**
   * Created timestamp
   */
  createdAt: Date;

  /**
   * Started timestamp
   */
  startedAt?: Date;

  /**
   * Completed timestamp
   */
  completedAt?: Date;

  /**
   * Progress (0-100)
   */
  progress: number;

  /**
   * Total items
   */
  totalItems: number;

  /**
   * Processed items
   */
  processedItems: number;

  /**
   * Failed items
   */
  failedItems: number;

  /**
   * Results
   */
  results?: any;

  /**
   * Errors
   */
  errors: BatchError[];
}

/**
 * Batch job type
 */
export type BatchJobType =
  | 'export' // Batch export sessions
  | 'import' // Batch import sessions
  | 'analyze' // Batch analysis
  | 'validate' // Batch validation
  | 'transform' // Batch transformation
  | 'index' // Batch indexing
  | 'backup' // Batch backup
  | 'cleanup'; // Batch cleanup

/**
 * Batch job status
 */
export type BatchJobStatus =
  | 'pending' // Waiting to start
  | 'running' // Currently executing
  | 'completed' // Successfully completed
  | 'failed' // Failed with errors
  | 'cancelled'; // Cancelled by user

/**
 * Batch job parameters
 */
export type BatchJobParams =
  | ExportBatchParams
  | ImportBatchParams
  | AnalyzeBatchParams
  | ValidateBatchParams
  | TransformBatchParams
  | IndexBatchParams
  | BackupBatchParams
  | CleanupBatchParams;

/**
 * Export batch parameters
 */
export interface ExportBatchParams {
  sessionIds: string[];
  format: 'json' | 'markdown' | 'latex' | 'html';
  outputPath: string;
  includeMetadata?: boolean;
}

/**
 * Import batch parameters
 */
export interface ImportBatchParams {
  inputPaths: string[];
  format: 'json' | 'markdown';
  validateBeforeImport?: boolean;
}

/**
 * Analyze batch parameters
 */
export interface AnalyzeBatchParams {
  sessionIds: string[];
  analysisType: 'taxonomy' | 'quality' | 'patterns' | 'all';
  saveResults?: boolean;
}

/**
 * Validate batch parameters
 */
export interface ValidateBatchParams {
  sessionIds: string[];
  strictMode?: boolean;
  autoFix?: boolean;
}

/**
 * Transform batch parameters
 */
export interface TransformBatchParams {
  sessionIds: string[];
  transformation: 'modeSwitch' | 'merge' | 'split' | 'sanitize';
  options: Record<string, any>;
}

/**
 * Index batch parameters
 */
export interface IndexBatchParams {
  sessionIds: string[];
  indexType: 'search' | 'analytics' | 'both';
  rebuild?: boolean;
}

/**
 * Backup batch parameters
 */
export interface BackupBatchParams {
  sessionIds?: string[];
  destination: string;
  compression?: boolean;
  encryption?: boolean;
}

/**
 * Cleanup batch parameters
 */
export interface CleanupBatchParams {
  maxAge?: number; // in days
  removeIncomplete?: boolean;
  removeEmpty?: boolean;
  dryRun?: boolean;
}

/**
 * Batch error
 */
export interface BatchError {
  itemId: string;
  itemIndex: number;
  error: string;
  timestamp: Date;
}

/**
 * Batch job result
 */
export interface BatchJobResult {
  jobId: string;
  status: BatchJobStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  duration: number; // in milliseconds
  errors: BatchError[];
  data?: any;
}

/**
 * Batch processor options
 */
export interface BatchProcessorOptions {
  /**
   * Maximum concurrent jobs
   */
  maxConcurrentJobs: number;

  /**
   * Maximum items per batch
   */
  maxBatchSize: number;

  /**
   * Retry failed items
   */
  retryFailedItems: boolean;

  /**
   * Maximum retries
   */
  maxRetries: number;

  /**
   * Progress callback
   */
  onProgress?: (job: BatchJob) => void;

  /**
   * Completion callback
   */
  onComplete?: (result: BatchJobResult) => void;
}
