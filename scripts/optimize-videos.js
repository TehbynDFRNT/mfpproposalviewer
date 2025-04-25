// scripts/optimize-videos.js
import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import pLimit from 'p-limit';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const SRC = 'public/videos_raw';
const OUT = 'public/_vid';
const limit = pLimit(3);                     // 3 parallel encodes

await fs.mkdir(OUT, { recursive: true });

const files = await fg(['**/*.{mp4,mov,avi,mkv}'], { cwd: SRC });

await Promise.all(
  files.map(f => limit(() => processOne(f)))
);

async function processOne(rel) {
  const src = path.join(SRC, rel);
  const base = path.parse(rel).name;         // hero.mov → hero
  const outDir = path.join(OUT, path.dirname(rel));
  await fs.mkdir(outDir, { recursive: true });

  // 1080p H.264 MP4 (baseline for Safari / older devices)
  await transcode(src, path.join(outDir, base + '-1080.mp4'),
                  ['-vf', 'scale=trunc(iw*min(1\\,1080/ih)):trunc(ih*min(1\\,1080/ih))',
                   '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
                   '-c:a', 'aac', '-b:a', '128k']);

  // 720p VP9 WebM (great compression for modern browsers)
  await transcode(src, path.join(outDir, base + '-720.webm'),
                  ['-vf', 'scale=trunc(iw*min(1\\,720/ih)):trunc(ih*min(1\\,720/ih))',
                   '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32',
                   '-c:a', 'libopus', '-b:a', '96k']);
}

function transcode(src, dest, extraArgs) {
  return new Promise((res, rej) => {
    ffmpeg(src)
      .outputOptions(extraArgs)
      .on('error', rej)
      .on('end', res)
      .save(dest);
  });
}