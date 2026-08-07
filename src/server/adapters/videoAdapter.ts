export async function createVideoJobRecord(payload: { user_id: string, file_url: string }){
  // Server-side helper: call Supabase REST (PostgREST) using service role key to insert a video_jobs row.
  // This function can be used by serverless endpoints to enqueue processing jobs.
  throw new Error('Not implemented')
}
