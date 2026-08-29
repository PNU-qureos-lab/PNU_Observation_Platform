# PNU Observation Platform

갯벌·농림을 시작으로 현장, 드론, 항공, 위성 관측자료를 날짜·위치·센서 기준으로 공개하는 확장형 통합 플랫폼입니다.

## 접속 주소

- 공개 사이트: <https://pnu-observation-hub.seung1100.chatgpt.site>
- 통합 GitHub: <https://github.com/PNU-qureos-lab/PNU_Observation_Platform>

## 포함 자료

- 갯벌 현장관측: 곰소만·황도, ASD, Specim-IQ, RAMSES, UAV, FENIX, LiDAR, Chl-a, 퇴적물
- 농림 현장관측: 밀양·부산·김해·전주, RAMSES, RGB, Red-edge, Skyphotos, LiDAR, Metashape
- 위성자료: PlanetScope 8밴드 표면반사도, 장면 footprint, 품질 메타데이터와 RGB 미리보기

`public/data/tidal-observations.json`에는 갯벌 관측의 세션·GPS·RAMSES 555 nm 시계열과 전체 PlanetScope 장면 메타데이터가 들어 있습니다. 농림 관측의 정규화 카탈로그는 `lib/catalog.ts`에서 관리합니다.

## 새 관측 분야 추가

1. `lib/catalog.ts`의 `domains`에 분야 ID, 이름, 색상, 설명을 등록합니다.
2. `Observation` 공통 스키마로 날짜, 장소, 센서, 위치 품질, 자료 상태를 추가합니다.
3. 탐색 필터, 지도, 상세 URL과 분야별 통계가 자동으로 생성됩니다.

분야별 특수 시각화는 독립 컴포넌트로 추가하되, 카탈로그와 기본 상세화면은 공통 구조를 유지합니다.

## 공개 및 출처

사이트와 저장소는 로그인 없이 공개합니다. 대용량 원자료는 동일 저장소의 Release 또는 공개 외부 저장소로 연결할 수 있습니다. 지도 배경은 OpenStreetMap을 사용하며, 각 자료의 원시시각·보정시각·좌표 품질·주의사항을 함께 보존합니다.

통합 전 원본 저장소:

- <https://github.com/PNU-qureos-lab/Tidal_Survey_SUM>
- <https://github.com/PNU-qureos-lab/AG_FIELD_SUM>
