import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';

const SOURCE_ROOT = process.env.AGRICULTURE_OBSERVATION_ROOT;
const OUTPUT = new URL('../public/data/agriculture-observations.json', import.meta.url);
const EXIFTOOL = process.env.EXIFTOOL_PATH ?? 'exiftool';
const MAX_TRACK_POINTS = 24;
const MAX_RAMSES_POINTS = 450;

const visits = [
  ['2026_03_27 밀양 부속캠', '2026-03-27-miryang'],
  ['2026_05_06 금정산 초입', '2026-05-06-geumjeong-entrance'],
  ['2026_05_07 밀양 부속캠', '2026-05-07-miryang'],
  ['2026_05_09 금정산 초입', '2026-05-09-geumjeong-entrance'],
  ['2026_05_10 김해 농지', '2026-05-10-gimhae'],
  ['2026_05_15 김해 양배추밭', '2026-05-15-gimhae-cabbage'],
  ['2026_06_10 농진청 운동장', '2026-06-10-rda'],
  ['2026_06_12 금정산 북문', '2026-06-12-geumjeong-north'],
  ['2026_06_18 김해 사전답사', '2026-06-18-gimhae'],
  ['2026_06_30 김해 농지', '2026-06-30-gimhae'],
  ['2026_07_16 김해 농지', '2026-07-16-gimhae'],
  ['2026_07_31 김해 농지', '2026-07-31-gimhae'],
  ['2026_08_06 금정산 북문', '2026-08-06-geumjeong-north'],
  ['2026_08_24 김해 농지', '2026-08-24-gimhae'],
];

function entries(path) {
  try {
    return readdirSync(path, { withFileTypes: true });
  } catch {
    return [];
  }
}

function directDirectory(path, pattern) {
  return entries(path).find((entry) => entry.isDirectory() && pattern.test(entry.name));
}

function filesRecursive(path, matcher, result = []) {
  for (const entry of entries(path)) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) filesRecursive(full, matcher, result);
    else if (matcher.test(entry.name)) result.push(full);
  }
  return result;
}

function directoriesWithDirectFiles(path, matcher, result = []) {
  const children = entries(path);
  if (children.some((entry) => entry.isFile() && matcher.test(entry.name))) result.push(path);
  for (const entry of children) {
    if (entry.isDirectory()) directoriesWithDirectFiles(join(path, entry.name), matcher, result);
  }
  return result;
}

function namedDirectories(path, matcher, result = []) {
  for (const entry of entries(path)) {
    if (!entry.isDirectory()) continue;
    const full = join(path, entry.name);
    if (matcher.test(entry.name)) result.push(full);
    namedDirectories(full, matcher, result);
  }
  return result;
}

function evenlySample(items, maximum) {
  if (items.length <= maximum) return items;
  const selected = [];
  for (let index = 0; index < maximum; index += 1) {
    selected.push(items[Math.round(index * (items.length - 1) / (maximum - 1))]);
  }
  return [...new Set(selected)];
}

function normalizeTime(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}:\d{2}:\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}T${match[4]}+09:00`;
  const datMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})/);
  if (datMatch) return `${datMatch[1]}-${datMatch[2]}-${datMatch[3]}T${datMatch[4]}+09:00`;
  return String(value);
}

function runExiftool(paths) {
  if (!paths.length) return [];
  const temp = mkdtempSync(join(tmpdir(), 'pnu-exif-'));
  const argFile = join(temp, 'files.txt');
  writeFileSync(argFile, paths.join('\n'), 'utf8');
  try {
    const result = spawnSync(EXIFTOOL, [
      '-json', '-n', '-charset', 'filename=utf8',
      '-GPSLatitude', '-GPSLongitude', '-DateTimeOriginal', '-CreateDate', '-Model',
      '-@', argFile,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    if (!result.stdout) return [];
    return JSON.parse(result.stdout);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function haversine(a, b) {
  const radius = 6371000;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function makeTrack(mission, visitPath, kind, fileMatcher, recursive = false) {
  let files = recursive
    ? filesRecursive(mission, fileMatcher).sort()
    : entries(mission).filter((entry) => entry.isFile() && fileMatcher.test(entry.name)).map((entry) => join(mission, entry.name)).sort();
  if (kind === '다분광') {
    const bandOne = files.filter((file) => /_1\.(tif|tiff)$/i.test(file));
    if (bandOne.length) files = bandOne;
  }
  const sampled = evenlySample(files, MAX_TRACK_POINTS);
  const metadata = runExiftool(sampled);
  const points = metadata.map((entry) => ({
    lat: Number(entry.GPSLatitude),
    lon: Number(entry.GPSLongitude),
    time: normalizeTime(entry.DateTimeOriginal ?? entry.CreateDate),
    source: basename(entry.SourceFile ?? ''),
  })).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon) && point.lat >= 30 && point.lat <= 40 && point.lon >= 120 && point.lon <= 135);
  points.sort((a, b) => String(a.time ?? a.source).localeCompare(String(b.time ?? b.source)));
  if (!points.length) return null;
  let distanceM = 0;
  for (let index = 1; index < points.length; index += 1) distanceM += haversine(points[index - 1], points[index]);
  const rel = relative(visitPath, mission).replaceAll('\\', '/');
  return {
    id: rel.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, ''),
    label: basename(mission),
    pathLabel: rel,
    kind,
    model: metadata.find((entry) => entry.Model)?.Model ?? (kind === 'LiDAR' ? 'DJI Zenmuse L1' : 'GPS EXIF'),
    start: points.find((point) => point.time)?.time ?? null,
    end: [...points].reverse().find((point) => point.time)?.time ?? null,
    timeBasis: kind === '다분광' ? 'MicaSense EXIF 장비시각(시차 미보정)' : '카메라 로컬시각(KST 가정)',
    distanceM: Math.round(distanceM),
    sourceImageCount: files.length,
    sampledPointCount: points.length,
    points: points.map(({ lat, lon, time }) => ({ lat, lon, time })),
  };
}

function extractTracks(visitPath) {
  const rawEntry = directDirectory(visitPath, /^01_Raw[ _]data$/i);
  if (!rawEntry) return [];
  const rawPath = join(visitPath, rawEntry.name);
  const tracks = [];

  const rgbEntry = directDirectory(rawPath, /^02_RGB$/i);
  if (rgbEntry) {
    const rgbRoot = join(rawPath, rgbEntry.name);
    for (const mission of directoriesWithDirectFiles(rgbRoot, /\.(jpg|jpeg)$/i)) {
      const track = makeTrack(mission, visitPath, 'RGB', /\.(jpg|jpeg)$/i, false);
      if (track) tracks.push(track);
    }
  }

  const redEdgeEntry = directDirectory(rawPath, /^01_(Re|RE)$/i);
  if (redEdgeEntry) {
    const redEdgeRoot = join(rawPath, redEdgeEntry.name);
    const syncDirs = namedDirectories(redEdgeRoot, /^SYNC.*SET/i);
    const candidates = syncDirs.length
      ? syncDirs
      : entries(redEdgeRoot).filter((entry) => entry.isDirectory()).map((entry) => join(redEdgeRoot, entry.name));
    for (const mission of candidates) {
      const track = makeTrack(mission, visitPath, '다분광', /\.(tif|tiff|jpg|jpeg)$/i, true);
      if (track) tracks.push(track);
    }
  }

  const lidarEntry = directDirectory(rawPath, /^04_LiDAR$/i);
  if (lidarEntry) {
    const lidarRoot = join(rawPath, lidarEntry.name);
    for (const mission of directoriesWithDirectFiles(lidarRoot, /\.(jpg|jpeg)$/i)) {
      const track = makeTrack(mission, visitPath, 'LiDAR', /\.(jpg|jpeg)$/i, false);
      if (track) tracks.push(track);
    }
  }

  return tracks;
}

function parseRamsesFile(path) {
  const text = readFileSync(path, 'utf8');
  const dateTime = text.match(/^DateTime\s*=\s*(.+)$/m)?.[1]?.trim();
  const dataIndex = text.indexOf('[DATA]');
  if (!dateTime || dataIndex < 0) return null;
  let nearest = null;
  for (const line of text.slice(dataIndex + 6).split(/\r?\n/)) {
    const match = line.match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)/);
    if (!match) continue;
    const wavelength = Number(match[1]);
    const intensity = Number(match[2]);
    if (!Number.isFinite(wavelength) || !Number.isFinite(intensity)) continue;
    if (!nearest || Math.abs(wavelength - 555) < Math.abs(nearest.wavelength - 555)) nearest = { wavelength, intensity };
  }
  if (!nearest || Math.abs(nearest.wavelength - 555) > 10) return null;
  return { time: normalizeTime(dateTime), intensity: nearest.intensity, wavelength: nearest.wavelength };
}

function extractRamses(visitPath) {
  const rawEntry = directDirectory(visitPath, /^01_Raw[ _]data$/i);
  if (!rawEntry) return null;
  const rawPath = join(visitPath, rawEntry.name);
  const ramsesEntry = directDirectory(rawPath, /RAMSES/i);
  if (!ramsesEntry) return null;
  const ramsesPath = join(rawPath, ramsesEntry.name);
  const irrEntry = directDirectory(ramsesPath, /^irr/i);
  const radEntry = directDirectory(ramsesPath, /^rad/i);
  const sourcePath = irrEntry ? join(ramsesPath, irrEntry.name) : radEntry ? join(ramsesPath, radEntry.name) : ramsesPath;
  const allFiles = filesRecursive(sourcePath, /\.dat$/i).sort();
  if (!allFiles.length) return null;
  const sampledFiles = evenlySample(allFiles, MAX_RAMSES_POINTS);
  const series = sampledFiles.map(parseRamsesFile).filter(Boolean).sort((a, b) => a.time.localeCompare(b.time));
  if (!series.length) return null;
  const actualNm = series.reduce((sum, point) => sum + point.wavelength, 0) / series.length;
  return {
    label: irrEntry ? 'RAMSES 하향복사조도' : 'RAMSES 복사휘도',
    measurement: irrEntry ? 'irradiance' : 'radiance',
    actualNm: Number(actualNm.toFixed(3)),
    unit: irrEntry ? 'mW/(m²·nm)' : 'mW/(m²·sr·nm)',
    start: series[0].time,
    end: series.at(-1).time,
    recordCount: allFiles.length,
    sampledCount: series.length,
    series,
  };
}

function boundsForTracks(tracks) {
  const points = tracks.flatMap((track) => track.points);
  if (!points.length) return null;
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lon);
  return {
    south: Math.min(...latitudes),
    west: Math.min(...longitudes),
    north: Math.max(...latitudes),
    east: Math.max(...longitudes),
  };
}

if (!SOURCE_ROOT) throw new Error('Set AGRICULTURE_OBSERVATION_ROOT to the local observation-data directory.');
if (!existsSync(SOURCE_ROOT)) throw new Error('AGRICULTURE_OBSERVATION_ROOT does not exist.');

const campaigns = [];
const metadata = {
  generatedAt: new Date().toISOString(),
  source: '농진청 드론 관측자료 모음',
  note: '비행경로는 각 촬영세트의 GPS EXIF를 균등 표본화했습니다. RAMSES는 555 nm 근접밴드를 시간축으로 표본화했습니다.',
};
for (const [folder, id] of visits) {
  const visitPath = join(SOURCE_ROOT, folder);
  if (!existsSync(visitPath)) continue;
  process.stdout.write(`Reading ${folder} ... `);
  const uavTracks = extractTracks(visitPath);
  const ramses = extractRamses(visitPath);
  campaigns.push({ id, folder, uavTracks, bounds: boundsForTracks(uavTracks), ramses });
  writeFileSync(OUTPUT, JSON.stringify({ meta: metadata, campaigns }, null, 2), 'utf8');
  process.stdout.write(`${uavTracks.length} tracks, ${ramses?.recordCount ?? 0} RAMSES records\n`);
}

writeFileSync(OUTPUT, JSON.stringify({
  meta: metadata,
  campaigns,
}, null, 2), 'utf8');

console.log(`Wrote ${OUTPUT.pathname}`);
