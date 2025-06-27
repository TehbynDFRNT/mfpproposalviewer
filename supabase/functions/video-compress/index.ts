// supabase/functions/video-compress.ts
//
// Trigger  : Storage ▸ Object created (OBJECT_FINALIZED)
// Runtime  : Supabase Edge (Deno 2)
// Limits   : 150 s (free) / 400 s (paid) wall-clock per invocation‹1›
// Env vars : SUPABASE_URL
//            SUPABASE_SERVICE_ROLE_KEY
//            RENDI_API_KEY         ← your long API key
//            POLL_MS   (optional, default 5000)
//            TIMEOUT_S (optional, default 240)   ← keep ≤ wall-clock-limit
//
// If you want to delete the raw upload after success, set DELETE_SOURCE=true
//-----------------------------------------------------------------------
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
const sb = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
const RENDI_API_KEY = Deno.env.get('RENDI_API_KEY');
const POLL_MS = Number(Deno.env.get('POLL_MS') ?? 5_000) // 5 s default
;
const TIMEOUT_S = Number(Deno.env.get('TIMEOUT_S') ?? 240) // 4 min default
;
// ─────────────────────────────────────────────────────────────────────────────
// CORS headers – allow browser pre-flight OPTIONS requests to succeed
// ─────────────────────────────────────────────────────────────────────────────
const CORS_HEADERS = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
});
//-----------------------------------------------------------------------
serve(async (req)=>{
  /* 0 — Handle CORS pre-flight (OPTIONS) ------------------------------ */ if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  /* 1 — parse Storage event ------------------------------------------------*/ const { bucketId, name } = await req.json() // standard Storage payload
  ;
  if (!name.endsWith('.mp4')) return new Response('ignored', {
    status: 200,
    headers: CORS_HEADERS
  });
  /* 2 — public URL (bucket is public) --------------------------------------*/ const { data: pub } = sb.storage.from(bucketId).getPublicUrl(name);
  const sourceUrl = pub.publicUrl;
  if (!sourceUrl) return new Response('could not build public URL', {
    status: 500,
    headers: CORS_HEADERS
  });
  /* 3 — kick off the FFmpeg command on Rendi -------------------------------*/ const rendiBody = {
    ffmpeg_command: '-i {{in_1}} -c:v libx264 -preset veryfast -crf 26 -movflags +faststart {{out_1}}',
    input_files: {
      in_1: sourceUrl
    },
    output_files: {
      out_1: 'compressed.mp4'
    },
    max_command_run_seconds: 900 // 15 min budget at Rendi
  };
  console.log('‣ sending to Rendi', rendiBody.input_files.in_1); // NEW
  const rendiResp = await fetch('https://api.rendi.dev/v1/run-ffmpeg-command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': RENDI_API_KEY
    },
    body: JSON.stringify(rendiBody)
  });
  const responseText = await rendiResp.text();
  console.log('‣ Rendi replied', rendiResp.status, responseText); // NEW
  if (!rendiResp.ok) {
    return new Response(`Rendi error ${rendiResp.status}`, {
      status: 502,
      headers: CORS_HEADERS
    });
  }
  // Parse the response text we already read
  const responseData = JSON.parse(responseText);
  const { command_id } = responseData;

  /* 3a — mark DB row as "processing" ------------------------------------ */
  {
    const { error } = await sb
      .from('3d')
      .update({
        compression_status: 'processing',
        rendi_command_id: command_id,
        updated_at: new Date().toISOString(),
      })
      .eq('video_path', name);          // <-- name & srcName are identical here
    if (error) console.error('DB-update processing failed', error);
  }
  /* 4 — background task: poll until done & push result ---------------------*/ EdgeRuntime.waitUntil(handleCommand(command_id, bucketId, name));
  /* 5 — answer Storage trigger immediately --------------------------------*/ return new Response('compression queued', {
    status: 202,
    headers: CORS_HEADERS
  });
});
//-----------------------------------------------------------------------
async function handleCommand(cmdId, bucket, srcName) {
  const pollUrl = `https://api.rendi.dev/v1/commands/${cmdId}`;
  const deadline = Date.now() + TIMEOUT_S * 1000;
  while(Date.now() < deadline){
    await delay(POLL_MS);
    const pollResp = await fetch(pollUrl, {
      headers: {
        'X-API-KEY': RENDI_API_KEY
      }
    });
    if (!pollResp.ok) throw new Error(`poll failed ${pollResp.status}`);
    console.log('⏳ poll', cmdId, '→', pollResp.status);
    const status = await pollResp.json() // spec: see docs.rendi.dev › poll‹2›
    ;
    if (status.status === 'SUCCESS') {
      const fileUrl = status.output_files.out_1.storage_url;
      await pushToBucket(bucket, srcName, fileUrl);

      // build compressed/<same-path>.mp4
      const compressedPath = `compressed/${srcName.replace(/\.mp4$/i, '.mp4')}`;

      // mark DB row as completed
      {
        const { error } = await sb
          .from('3d')
          .update({
            compression_status: 'completed',
            compressed_path: compressedPath,
            updated_at: new Date().toISOString(),
          })
          .eq('video_path', srcName);
        if (error) console.error('DB-update completed failed', error);
      }

      if (Deno.env.get('DELETE_SOURCE') === 'true') {
        await sb.storage.from(bucket).remove([
          srcName
        ]);
      }
      return;
    }
    if (status.status === 'ERROR') {
      console.error('Rendi job failed', status.error_message);

      // store failure message
      {
        const { error } = await sb
          .from('3d')
          .update({
            compression_status: 'failed',
            compression_error: status.error_message ?? 'unknown',
            updated_at: new Date().toISOString(),
          })
          .eq('video_path', srcName);
        if (error) console.error('DB-update failed-status failed', error);
      }

      return;
    }
  }
  console.error('Timed out waiting for Rendi job (hit TIMEOUT_S)');
}
/* util -------------------------------------------------------------------*/ const delay = (ms: number)=>new Promise((r)=>setTimeout(r, ms));
async function pushToBucket(bucket: string, srcName: string, fileUrl: string) {
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`download error ${resp.status}`);
  // write to compressed/<same-basename>.mp4
  const dst = `compressed/${srcName.replace(/\.mp4$/i, '.mp4')}`;
  const { error } = await sb.storage.from(bucket).upload(dst, await resp.arrayBuffer(), {
    upsert: true,
    contentType: 'video/mp4'
  });
  if (error) throw error;
}
