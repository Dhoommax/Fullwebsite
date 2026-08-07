export interface IVideoUploadService {
  upload(file: File): Promise<{ id: string, url?: string }>
}

export interface IVideoProcessingJob {
  createJob(payload: any): Promise<{ jobId: string }>
  getStatus(jobId: string): Promise<{ status: string, progress?: number }>
}
