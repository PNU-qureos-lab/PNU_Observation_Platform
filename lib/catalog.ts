export type DataStatus = 'ready' | 'processed' | 'review';

export type Domain = {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  color: string;
  light: string;
  icon: 'waves' | 'sprout' | 'layers';
  order: number;
};

export type Observation = {
  id: string;
  domainId: string;
  date: string;
  title: string;
  place: string;
  region: string;
  latitude?: number;
  longitude?: number;
  coordinateSource?: string;
  positionQuality: 'measured' | 'centroid' | 'reference' | 'unknown';
  timeWindow?: string;
  summary: string;
  sensors: string[];
  status: DataStatus;
  cover?: string;
  trackSets?: number;
  imageCount?: number;
  skyImages?: number;
  sessions?: string[];
  note?: string;
  repository: string;
};

export type SatelliteAcquisition = {
  date: string;
  start: string;
  end: string;
  sceneCount: number;
  preview: string;
  cloud: number;
  clear: number;
  gsd: number;
  satelliteId: string;
};

export const repositories = {
  platform: 'https://github.com/PNU-qureos-lab/PNU_Observation_Platform',
  tidal: 'https://github.com/PNU-qureos-lab/PNU_Observation_Platform',
  agriculture: 'https://github.com/PNU-qureos-lab/PNU_Observation_Platform',
};

export const domains: Domain[] = [
  {
    id: 'tidal-flat',
    label: '갯벌',
    labelEn: 'Tidal Flat',
    description: '연안 갯벌의 현장 분광, 드론, 항공 초분광과 시료 분석 자료',
    color: '#007f8a',
    light: '#dff5f5',
    icon: 'waves',
    order: 1,
  },
  {
    id: 'agriculture',
    label: '농림',
    labelEn: 'Agriculture & Forest',
    description: '농지·산림의 반복 드론 관측, 지상 분광, 하늘상태와 LiDAR 자료',
    color: '#4f8f24',
    light: '#edf7df',
    icon: 'sprout',
    order: 2,
  },
];

const tidal: Observation[] = [
  {
    id: '2024-10-04-gomso', domainId: 'tidal-flat', date: '2024-10-04', title: '곰소만 갯벌 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.526176, longitude: 126.501353, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '08:09–11:52', summary: 'Specim-IQ 지상 초분광과 UAV GRID·BRDF, Chl-a 자료가 중심인 조사일입니다.', sensors: ['Specim-IQ', 'Chl-a', 'UAV RGB', 'RedEdge'], status: 'processed', cover: '/tidal/thumbs/2024-10-04-gomso/01-uav-rgb.webp', trackSets: 31, note: 'Specim-IQ 내부에 2024-10-05 촬영분이 함께 있어 조사일 메타데이터를 분리했습니다.', repository: repositories.tidal,
  },
  {
    id: '2024-10-05-gomso', domainId: 'tidal-flat', date: '2024-10-05', title: '곰소만 갯벌 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.544823, longitude: 126.558134, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '07:41–13:36', summary: 'ASD 처리자료, Specim-IQ, FENIX 항공 초분광, UAV와 BRDF-VNIR 산출물이 함께 있습니다.', sensors: ['Specim-IQ', 'FENIX', 'UAV RGB', 'RedEdge', '퇴적물'], status: 'processed', cover: '/tidal/thumbs/2024-10-05-gomso/01-uav-rgb.webp', trackSets: 50, repository: repositories.tidal,
  },
  {
    id: '2024-10-17-hwangdo', domainId: 'tidal-flat', date: '2024-10-17', title: '황도 반사도 자료', place: '황도', region: '충남 태안', positionQuality: 'unknown', summary: '황도 반사도 NetCDF 원본과 평활화 산출물로 구성된 별도 자료 묶음입니다.', sensors: ['Reflectance NetCDF'], status: 'review', note: '표준 센서별 폴더 구조와 GPS가 없어 위치·시간 확인이 필요합니다.', repository: repositories.tidal,
  },
  {
    id: '2025-02-14-gomso', domainId: 'tidal-flat', date: '2025-02-14', title: '곰소만 겨울 갯벌 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.534248, longitude: 126.53005, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '09:20–12:06', summary: 'Specim-IQ, UAV, 항공 보정영상과 퇴적물 통합자료가 모인 겨울 조사일입니다.', sensors: ['Specim-IQ', 'UAV RGB', 'RedEdge', '퇴적물'], status: 'processed', cover: '/tidal/thumbs/2025-02-14-gomso/01-uav-rgb.webp', trackSets: 34, note: 'FENIX 폴더명에는 02-15 촬영시각이 포함되어 보관 폴더 날짜와 실제 비행일이 다릅니다.', repository: repositories.tidal,
  },
  {
    id: '2025-02-15-gomso', domainId: 'tidal-flat', date: '2025-02-15', title: '곰소만 항공·UAV 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.528048, longitude: 126.505254, coordinateSource: 'UAV GPS 중심', positionQuality: 'centroid', timeWindow: '09:22–12:07', summary: 'Specim-IQ 연속선 제거 분석과 UAV 및 일부 FENIX 촬영자료가 중심입니다.', sensors: ['FENIX', 'UAV RGB', 'RedEdge'], status: 'processed', cover: '/tidal/thumbs/2025-02-15-gomso/01-uav-rgb.webp', trackSets: 27, repository: repositories.tidal,
  },
  {
    id: '2025-09-21-gomso', domainId: 'tidal-flat', date: '2025-09-21', title: '곰소만 다중센서 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.564259, longitude: 126.620769, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '10:13–12:15', summary: 'Specim-IQ, Chl-a, UAV·지상 다분광·LiDAR와 RedEdge-MX 처리자료가 함께 있습니다.', sensors: ['Specim-IQ', 'Chl-a', 'RedEdge-MX', 'LiDAR'], status: 'processed', cover: '/tidal/thumbs/2025-09-21-gomso/01-uav-rgb.webp', trackSets: 73, note: 'UAV 폴더에 2025-09-19 예비조사와 연습·후처리 폴더가 함께 있습니다.', repository: repositories.tidal,
  },
  {
    id: '2025-10-25-hwangdo', domainId: 'tidal-flat', date: '2025-10-25', title: '황도 다중분광 관측', place: '황도', region: '현장 GPS 기준', latitude: 35.549555, longitude: 126.573799, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '09:24–13:00', summary: 'ASD, Specim-IQ, RAMSES, FENIX 항공 초분광과 UAV를 함께 운용한 조사일입니다.', sensors: ['ASD', 'Specim-IQ', 'RAMSES', 'FENIX', 'UAV RGB'], status: 'review', cover: '/tidal/thumbs/2025-10-25-hwangdo/01-specim-iq.webp', trackSets: 8, note: 'RAMSES 내부 장비시각은 2025-09-28로 기록되어 조사일과 불일치합니다.', repository: repositories.tidal,
  },
  {
    id: '2025-10-26-gomso', domainId: 'tidal-flat', date: '2025-10-26', title: '곰소만 다중분광 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.557822, longitude: 126.613814, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '08:58–13:00', summary: 'ASD, Specim-IQ, RAMSES, 항공 정사영상과 UAV GRID 자료가 있는 조사일입니다.', sensors: ['ASD', 'Specim-IQ', 'RAMSES', 'UAV RGB'], status: 'review', cover: '/tidal/thumbs/2025-10-26-gomso/01-uav-rgb.webp', trackSets: 6, note: 'RAMSES 내부 장비시각은 2025-09-29로 기록되어 조사일과 불일치합니다.', repository: repositories.tidal,
  },
  {
    id: '2026-02-05-gomso', domainId: 'tidal-flat', date: '2026-02-05', title: '곰소만 겨울 다중센서 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.553845, longitude: 126.593095, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '09:45–12:49', summary: '하전·송현 Specim-IQ, RAMSES, 색소·Chl-a, UAV 예비·본조사 자료가 모여 있습니다.', sensors: ['Specim-IQ', 'RAMSES', 'UAV RGB', 'RedEdge'], status: 'review', cover: '/tidal/thumbs/2026-02-05-gomso/01-uav-rgb.webp', trackSets: 16, note: 'ASD 수막 폴더의 02-07 자료와 02-03·02-04 예비조사를 원시 날짜로 보존합니다.', repository: repositories.tidal,
  },
  {
    id: '2026-02-06-gomso', domainId: 'tidal-flat', date: '2026-02-06', title: '곰소만 GRID·BRDF 관측', place: '곰소만', region: '전북 고창·부안', latitude: 35.531437, longitude: 126.51504, coordinateSource: 'UAV·Specim GPS 중심', positionQuality: 'centroid', timeWindow: '08:59–13:12', summary: '하전 Specim-IQ와 UAV GRID·BRDF·지상 다분광 촬영자료가 중심입니다.', sensors: ['Specim-IQ', 'UAV RGB', 'RedEdge', 'BRDF'], status: 'processed', cover: '/tidal/thumbs/2026-02-06-gomso/01-uav-rgb.webp', trackSets: 25, repository: repositories.tidal,
  },
];

const agriculture: Observation[] = [
  { id: '2026-03-27-miryang', domainId: 'agriculture', date: '2026-03-27', title: '밀양 부속캠 반복 관측', place: '밀양 부속캠', region: '경남 밀양', latitude: 35.501363, longitude: 128.721454, coordinateSource: '대표 RGB 사진 GPS EXIF', positionQuality: 'measured', timeWindow: '14:10 대표시각', summary: '부속캠퍼스 농림 대상 RAMSES, Red-edge, RGB 반복 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB'], status: 'ready', cover: '/agri/samples/2026-03-27-miryang-rgb-50.jpg', trackSets: 5, imageCount: 977, sessions: ['260327_1358'], note: 'Skyphotos 폴더는 있으나 이미지가 없습니다.', repository: repositories.agriculture },
  { id: '2026-05-07-miryang', domainId: 'agriculture', date: '2026-05-07', title: '밀양 부속캠 반복 관측', place: '밀양 부속캠', region: '경남 밀양', latitude: 35.500857, longitude: 128.721413, coordinateSource: '대표 RGB 사진 GPS EXIF', positionQuality: 'measured', timeWindow: '12:54 대표시각', summary: '3월과 같은 지점에서 수행한 RAMSES, Red-edge, RGB 반복 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB'], status: 'ready', cover: '/agri/samples/2026-05-07-miryang-rgb-50.jpg', trackSets: 6, imageCount: 3383, sessions: ['02. RGB'], note: 'Skyphotos 폴더는 있으나 이미지가 없습니다.', repository: repositories.agriculture },
  { id: '2026-05-06-geumjeong-entrance', domainId: 'agriculture', date: '2026-05-06', title: '금정산 초입 산림 관측', place: '금정산 초입', region: '부산 금정구', latitude: 35.231584, longitude: 129.074212, coordinateSource: '첫 RGB 세트 GPS EXIF', positionQuality: 'measured', timeWindow: '15:06 대표시각', summary: '금정산 초입 산림을 대상으로 수행한 현장 분광과 드론 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB'], status: 'ready', cover: '/agri/samples/2026-05-06-geumjeong-entrance-rgb-50.jpg', trackSets: 2, imageCount: 32, sessions: ['DJI_202605061452_004', 'DJI_202605061452_005'], note: 'Skyphotos 폴더는 있으나 이미지가 없습니다.', repository: repositories.agriculture },
  { id: '2026-05-09-geumjeong-entrance', domainId: 'agriculture', date: '2026-05-09', title: '금정산 초입 산림 관측', place: '금정산 초입', region: '부산 금정구', latitude: 35.233486, longitude: 129.074188, coordinateSource: '검증된 15:16 RGB 세트 GPS EXIF', positionQuality: 'measured', timeWindow: '15:20 대표시각', summary: 'Red-edge와 RGB를 사용한 산림 반복 관측입니다.', sensors: ['Red-edge', 'RGB'], status: 'review', cover: '/agri/samples/2026-05-09-geumjeong-entrance-rgb-50.jpg', trackSets: 6, imageCount: 1732, sessions: ['260509_1236', '260509_1516'], note: '260509_1236 세션은 다음날 김해 좌표를 가리켜 대표위치와 샘플에서 제외했습니다. RAMSES는 미촬영입니다.', repository: repositories.agriculture },
  { id: '2026-05-10-gimhae', domainId: 'agriculture', date: '2026-05-10', title: '김해 농지 다중센서 관측', place: '김해 농지', region: '경남 김해', latitude: 35.201565, longitude: 128.888942, coordinateSource: 'junk 제외 RGB GPS EXIF', positionQuality: 'measured', timeWindow: '08:53 대표시각', summary: '시간대를 나눠 RAMSES, Red-edge, RGB를 반복 촬영한 김해 농지 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', 'Skyphotos XLSX'], status: 'review', cover: '/agri/samples/2026-05-10-gimhae-rgb-50.jpg', trackSets: 22, imageCount: 7150, sessions: ['08:35 M4T', '09:43', '10:49', '12:08', '13:28 M4T', '13:51 M4T', '14:17 M4T'], note: '촬영 세트에는 0. junk 아래 폴더가 포함되며 Skyphotos는 Excel 기록만 있습니다.', repository: repositories.agriculture },
  { id: '2026-06-18-gimhae', domainId: 'agriculture', date: '2026-06-18', title: '김해 농지 사전답사', place: '김해 농지', region: '경남 김해', latitude: 35.199674, longitude: 128.888843, coordinateSource: '첫 DJI 촬영 폴더 GPS EXIF', positionQuality: 'measured', timeWindow: '18:46 대표시각', summary: 'RGB 드론만 실제 촬영된 김해 농지 사전답사입니다.', sensors: ['RGB'], status: 'ready', cover: '/agri/samples/2026-06-18-gimhae-rgb-50.jpg', trackSets: 3, imageCount: 2195, sessions: ['DJI_202606181841_001', 'DJI_202606181841_002', 'DJI_202606181841_003'], note: 'RAMSES, Red-edge, Skyphotos는 폴더만 있고 내부 데이터가 없습니다.', repository: repositories.agriculture },
  { id: '2026-06-30-gimhae', domainId: 'agriculture', date: '2026-06-30', title: '김해 농지 반복 관측', place: '김해 농지', region: '경남 김해', latitude: 35.201986, longitude: 128.888957, coordinateSource: '첫 RGB 시간대 GPS EXIF', positionQuality: 'measured', timeWindow: '10:08 대표시각', summary: 'RAMSES, Red-edge, RGB와 Metashape 프로젝트가 함께 있는 반복 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', 'Metashape'], status: 'processed', cover: '/agri/samples/2026-06-30-gimhae-rgb-50.jpg', trackSets: 13, imageCount: 5812, sessions: ['10:00', '11:39', '12:26', '13:35', '14:42'], note: 'Skyphotos 폴더는 있으나 이미지가 없습니다.', repository: repositories.agriculture },
  { id: '2026-07-16-gimhae', domainId: 'agriculture', date: '2026-07-16', title: '김해 농지 하늘상태 관측', place: '김해 농지', region: '경남 김해', latitude: 35.201986, longitude: 128.888957, coordinateSource: '동일 지점 2026-06-30 참고좌표', positionQuality: 'reference', summary: 'RAMSES와 Skyphotos 중심의 관측일입니다.', sensors: ['RAMSES', 'Skyphotos'], status: 'review', cover: '/agri/samples/2026-07-16-gimhae-sky.jpg', skyImages: 26, note: '이 날짜에는 RGB EXIF가 없어 6월 30일 동일 지점 좌표를 참고값으로 사용합니다.', repository: repositories.agriculture },
  { id: '2026-07-31-gimhae', domainId: 'agriculture', date: '2026-07-31', title: '김해 농지 다중센서 반복 관측', place: '김해 농지', region: '경남 김해', latitude: 35.201877, longitude: 128.886406, coordinateSource: '25·50·75% RGB 표본 GPS 중심', positionQuality: 'centroid', timeWindow: '11:16–14:30', summary: 'RAMSES, Red-edge, RGB, Skyphotos를 함께 운용한 반복 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', 'Skyphotos'], status: 'processed', cover: '/agri/samples/2026-07-31-gimhae-rgb-50.jpg', trackSets: 16, imageCount: 5007, skyImages: 2, sessions: ['10:06', '11:11', '12:12', '13:28', '14:15', '임의촬영'], note: 'Red-edge 대량 촬영자료와 Skyphotos 접촉시트·GIF·Excel 기록이 있습니다.', repository: repositories.agriculture },
  { id: '2026-05-15-gimhae-cabbage', domainId: 'agriculture', date: '2026-05-15', title: '김해 양배추밭 관측', place: '김해 양배추밭', region: '경남 김해', latitude: 35.187486, longitude: 128.889253, coordinateSource: '첫 RGB 시간대 GPS EXIF', positionQuality: 'measured', timeWindow: '09:39 대표시각', summary: '양배추 재배지에서 수행한 RAMSES, Red-edge, RGB 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB'], status: 'ready', cover: '/agri/samples/2026-05-15-gimhae-cabbage-rgb-50.jpg', trackSets: 14, imageCount: 8094, sessions: ['09:30', '10:45', '11:29', '12:02', '12:07', '12:29', '13:28', '14:55'], note: '일부 RGB 폴더는 사진이 1~2장뿐이지만 촬영 세트에는 포함했습니다.', repository: repositories.agriculture },
  { id: '2026-06-10-rda', domainId: 'agriculture', date: '2026-06-10', title: '농진청 운동장 관측', place: '농진청 운동장', region: '전북 전주', latitude: 35.828495, longitude: 127.051653, coordinateSource: '첫 RGB 시간대 GPS EXIF', positionQuality: 'measured', timeWindow: '09:55 대표시각', summary: '시간대를 나눠 수행한 RAMSES, Red-edge, RGB 관측과 현장 야장이 있습니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', '현장 야장'], status: 'ready', cover: '/agri/samples/2026-06-10-rda-rgb-50.jpg', trackSets: 26, imageCount: 3568, sessions: ['09:09', '11:39', '12:41', '14:34'], note: 'Raw 폴더에 드론 야장 Excel 파일이 포함되어 있습니다.', repository: repositories.agriculture },
  { id: '2026-06-12-geumjeong-north', domainId: 'agriculture', date: '2026-06-12', title: '금정산 북문 산림 관측', place: '금정산 북문', region: '부산 금정구', latitude: 35.275407, longitude: 129.056653, coordinateSource: '첫 RGB 시간대 GPS EXIF', positionQuality: 'measured', timeWindow: '10:52 대표시각', summary: '금정산 북문 일대 산림의 RAMSES, Red-edge, RGB 반복 관측입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', 'Skyphotos XLSX'], status: 'ready', cover: '/agri/samples/2026-06-12-geumjeong-north-rgb-50.jpg', trackSets: 18, imageCount: 4981, sessions: ['10:50', '12:13', '14:03'], note: 'Skyphotos에는 Excel 기록만 있고 이미지가 없습니다.', repository: repositories.agriculture },
  { id: '2026-08-06-geumjeong-north', domainId: 'agriculture', date: '2026-08-06', title: '금정산 북문 LiDAR 관측', place: '금정산 북문', region: '부산 금정구', latitude: 35.274189, longitude: 129.058201, coordinateSource: 'RGB 6개 비행 그룹 GPS 중심', positionQuality: 'centroid', timeWindow: '09:53–15:46', summary: '금정산 북문 반복 관측에 LiDAR 비행을 추가한 다중센서 조사입니다.', sensors: ['RAMSES', 'Red-edge', 'RGB', 'Skyphotos', 'LiDAR'], status: 'processed', cover: '/agri/samples/2026-08-06-geumjeong-north-rgb-50.jpg', trackSets: 6, imageCount: 4111, skyImages: 1, sessions: ['LiDAR 09:53', '10:45', '11:46', '12:46', '13:47', '14:43', '15:46'], note: 'RGB 대표좌표는 6개 비행 그룹 표본의 중심값입니다.', repository: repositories.agriculture },
];

export const observations: Observation[] = [...tidal, ...agriculture].sort((a, b) => b.date.localeCompare(a.date));

export const satelliteAcquisitions: SatelliteAcquisition[] = [
  { date: '2021-05-12', start: '2021-05-12T01:27:51Z', end: '2021-05-12T02:21:09Z', sceneCount: 5, preview: '/tidal/satellite/2021-05-12/20210512-012751-02-2428.webp', cloud: 0, clear: 100, gsd: 4.1, satelliteId: '2428' },
  { date: '2021-08-10', start: '2021-08-10T02:15:25Z', end: '2021-08-10T02:16:48Z', sceneCount: 4, preview: '/tidal/satellite/2021-08-10/20210810-021525-90-2408.webp', cloud: 24, clear: 70, gsd: 4.0, satelliteId: '2408' },
  { date: '2022-05-04', start: '2022-05-04T01:21:03Z', end: '2022-05-04T01:26:28Z', sceneCount: 6, preview: '/tidal/satellite/2022-05-04/20220504-012103-07-2459.webp', cloud: 0, clear: 100, gsd: 4.0, satelliteId: '2459' },
  { date: '2022-05-17', start: '2022-05-17T02:06:33Z', end: '2022-05-17T02:06:36Z', sceneCount: 2, preview: '/tidal/satellite/2022-05-17/20220517-020633-80-227b.webp', cloud: 0, clear: 100, gsd: 4.1, satelliteId: '227b' },
  { date: '2023-03-13', start: '2023-03-13T01:26:31Z', end: '2023-03-13T02:00:11Z', sceneCount: 5, preview: '/tidal/satellite/2023-03-13/20230313-012631-03-24c0.webp', cloud: 0, clear: 100, gsd: 4.1, satelliteId: '24c0' },
  { date: '2023-03-20', start: '2023-03-20T01:21:41Z', end: '2023-03-20T01:24:38Z', sceneCount: 4, preview: '/tidal/satellite/2023-03-20/20230320-012141-19-2429.webp', cloud: 0, clear: 100, gsd: 3.8, satelliteId: '2429' },
  { date: '2023-05-23', start: '2023-05-23T01:58:15Z', end: '2023-05-23T01:58:20Z', sceneCount: 3, preview: '/tidal/satellite/2023-05-23/20230523-015815-72-2481.webp', cloud: 0, clear: 100, gsd: 3.8, satelliteId: '2481' },
  { date: '2024-01-27', start: '2024-01-27T01:30:16Z', end: '2024-01-27T01:32:52Z', sceneCount: 4, preview: '/tidal/satellite/2024-01-27/20240127-013016-98-24c3.webp', cloud: 0, clear: 81, gsd: 3.9, satelliteId: '24c3' },
  { date: '2024-06-10', start: '2024-06-10T01:34:09Z', end: '2024-06-10T02:26:16Z', sceneCount: 7, preview: '/tidal/satellite/2024-06-10/20240610-013409-45-24b5.webp', cloud: 0, clear: 100, gsd: 3.7, satelliteId: '24b5' },
  { date: '2024-11-09', start: '2024-11-09T01:47:27Z', end: '2024-11-09T01:47:29Z', sceneCount: 2, preview: '/tidal/satellite/2024-11-09/20241109-014727-61-24c7.webp', cloud: 0, clear: 100, gsd: 3.5, satelliteId: '24c7' },
  { date: '2025-04-16', start: '2025-04-16T02:37:43Z', end: '2025-04-16T02:37:47Z', sceneCount: 3, preview: '/tidal/satellite/2025-04-16/20250416-023743-20-24ae.webp', cloud: 0, clear: 100, gsd: 3.7, satelliteId: '24ae' },
  { date: '2026-04-21', start: '2026-04-21T02:19:21Z', end: '2026-04-21T02:49:15Z', sceneCount: 4, preview: '/tidal/satellite/2026-04-21/20260421-021921-43-254d.webp', cloud: 0, clear: 100, gsd: 3.9, satelliteId: '254d' },
].sort((a, b) => b.date.localeCompare(a.date));

export function getDomain(id: string) {
  return domains.find((domain) => domain.id === id);
}

export function getObservation(id: string) {
  return observations.find((observation) => observation.id === id);
}

export function getSensorList() {
  return [...new Set(observations.flatMap((observation) => observation.sensors))].sort();
}
