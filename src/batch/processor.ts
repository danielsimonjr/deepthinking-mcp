/**
 * Batch Processor (v3.4.0)
 * Phase 4 Task 9.4: Batch job execution and management
 */

import { randomUUID } from 'crypto';
import type {
  BatchJob,
  BatchJobType,
  BatchJobParams,
  BatchJobResult,
  BatchProcessorOptions,
} from './types.js';

/**
 * Default processor options
 */
const DEFAULT_OPTIONS: BatchProcessorOptions = {
  maxConcurrentJobs: 3,
  maxBatchSize: 100,
  retryFailedItems: true,
  maxRetries: 3,
};

/**
 * Batch processor for executing jobs
 */
export class BatchProcessor {
  private jobs: Map<string, BatchJob>;
  private queue: string[];
  private running: Set<string>;
  private options: BatchProcessorOptions;

  constructor(options: Partial<BatchProcessorOptions> = {}) {
    this.jobs = new Map();
    this.queue = [];
    this.running = new Set();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Create a new batch job
   */
  createJob(type: BatchJobType, params: BatchJobParams): BatchJob {
    const job: BatchJob = {
      id: randomUUID(),
      type,
      status: 'pending',
      params,
      createdAt: new Date(),
      progress: 0,
      totalItems: this.getTotalItems(params),
      processedItems: 0,
      failedItems: 0,
      errors: [],
    };

    this.jobs.set(job.id, job);
    this.queue.push(job.id);

    // Try to start job if capacity available
    this.processQueue();

    return job;
  }

  /**
   * Submit a new batch job (alias for createJob that returns job ID)
   * Supports both nested { type, params } and flat { type, ...params } formats
   */
  async submitJob(params: any): Promise<string> {
    const type: BatchJobType = params.type;
    const jobParams: BatchJobParams = params.params || params; // Handle both formats
    const job = this.createJob(type, jobParams);
    return job.id;
  }

  /**
   * Get total items from params
   */
  private getTotalItems(params: BatchJobParams): number {
    if ('sessionIds' in params && params.sessionIds) {
      return params.sessionIds.length;
    }
    if ('inputPaths' in params) {
      return params.inputPaths.length;
    }
    return 0;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get job status (alias for getJob)
   */
  getJobStatus(jobId: string): BatchJob | undefined {
    return this.getJob(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'pending') {
      // Remove from queue
      const queueIndex = this.queue.indexOf(jobId);
      if (queueIndex >= 0) {
        this.queue.splice(queueIndex, 1);
      }
      job.status = 'cancelled';
      return true;
    }

    if (job.status === 'running') {
      // Mark as cancelled (actual cancellation depends on implementation)
      job.status = 'cancelled';
      this.running.delete(jobId);
      this.processQueue();
      return true;
    }

    return false;
  }

  /**
   * Process job queue
   */
  private async processQueue(): Promise<void> {
    // Start jobs up to concurrency limit
    while (
      this.running.size < this.options.maxConcurrentJobs &&
      this.queue.length > 0
    ) {
      const jobId = this.queue.shift()!;
      const job = this.jobs.get(jobId);

      if (!job || job.status !== 'pending') {
        continue;
      }

      this.running.add(jobId);
      job.status = 'running';
      job.startedAt = new Date();

      // Execute job asynchronously
      this.executeJob(job).then(() => {
        this.running.delete(jobId);
        this.processQueue();
      });
    }
  }

  /**
   * Execute a batch job
   */
  private async executeJob(job: BatchJob): Promise<void> {
    try {
      switch (job.type) {
        case 'export':
          await this.executeExportJob(job);
          break;

        case 'import':
          await this.executeImportJob(job);
          break;

        case 'analyze':
          await this.executeAnalyzeJob(job);
          break;

        case 'validate':
          await this.executeValidateJob(job);
          break;

        case 'transform':
          await this.executeTransformJob(job);
          break;

        case 'index':
          await this.executeIndexJob(job);
          break;

        case 'backup':
          await this.executeBackupJob(job);
          break;

        case 'cleanup':
          await this.executeCleanupJob(job);
          break;

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Mark as completed
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;

      // Call completion callback
      if (this.options.onComplete) {
        this.options.onComplete(this.jobToResult(job));
      }
    } catch (error) {
      // Mark as failed
      job.status = 'failed';
      job.completedAt = new Date();
      job.errors.push({
        itemId: 'job',
        itemIndex: -1,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      // Call completion callback
      if (this.options.onComplete) {
        this.options.onComplete(this.jobToResult(job));
      }
    }
  }

  /**
   * Execute export job
   */
  private async executeExportJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.sessionIds.length; i++) {
      const sessionId = params.sessionIds[i];

      try {
        // Simulate export operation
        await this.sleep(100);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        // Call progress callback
        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute import job
   */
  private async executeImportJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.inputPaths.length; i++) {
      const path = params.inputPaths[i];

      try {
        // Simulate import operation
        await this.sleep(100);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: path,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute analyze job
   */
  private async executeAnalyzeJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.sessionIds.length; i++) {
      const sessionId = params.sessionIds[i];

      try {
        // Simulate analysis
        await this.sleep(50);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute validate job
   */
  private async executeValidateJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.sessionIds.length; i++) {
      const sessionId = params.sessionIds[i];

      try {
        // Simulate validation
        await this.sleep(50);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute transform job
   */
  private async executeTransformJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.sessionIds.length; i++) {
      const sessionId = params.sessionIds[i];

      try {
        // Simulate transformation
        await this.sleep(100);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute index job
   */
  private async executeIndexJob(job: BatchJob): Promise<void> {
    const params = job.params as any;

    for (let i = 0; i < params.sessionIds.length; i++) {
      const sessionId = params.sessionIds[i];

      try {
        // Simulate indexing
        await this.sleep(75);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute backup job
   */
  private async executeBackupJob(job: BatchJob): Promise<void> {
    const params = job.params as any;
    const sessionIds = params.sessionIds || [];

    job.totalItems = sessionIds.length || 1;

    for (let i = 0; i < (sessionIds.length || 1); i++) {
      const sessionId = sessionIds[i] || 'all';

      try {
        // Simulate backup
        await this.sleep(150);

        job.processedItems++;
        job.progress = Math.floor((job.processedItems / job.totalItems) * 100);

        if (this.options.onProgress) {
          this.options.onProgress(job);
        }
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          itemId: sessionId,
          itemIndex: i,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute cleanup job
   */
  private async executeCleanupJob(job: BatchJob): Promise<void> {
    // Cleanup is a single operation
    job.totalItems = 1;

    try {
      // Simulate cleanup
      await this.sleep(200);

      job.processedItems = 1;
      job.progress = 100;

      if (this.options.onProgress) {
        this.options.onProgress(job);
      }
    } catch (error) {
      job.failedItems = 1;
      job.errors.push({
        itemId: 'cleanup',
        itemIndex: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }

  /**
   * Convert job to result
   */
  private jobToResult(job: BatchJob): BatchJobResult {
    const duration = job.completedAt && job.startedAt
      ? job.completedAt.getTime() - job.startedAt.getTime()
      : 0;

    return {
      jobId: job.id,
      status: job.status,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      failedItems: job.failedItems,
      duration,
      errors: job.errors,
      data: job.results,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): number {
    let cleared = 0;
    for (const [id, job] of this.jobs) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Get statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length,
    };
  }
}
