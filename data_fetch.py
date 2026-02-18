#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
생활화학제품 신고증명서 발급 현황 데이터 수집 스크립트
공공데이터포털 오픈API 활용

API: 한국환경산업기술원_화학제품관리시스템_신고대상 안전확인대상 생활화학제품 신고증명서 발급 현황
"""

import os
import time
import csv
import json
import sys
import urllib.request
import urllib.parse
import urllib.error


# ──────────────────────────────────────────────
# 설정
# ──────────────────────────────────────────────
BASE_URL = (
    "https://api.odcloud.kr/api/15105295/v1/"
    "uddi:35c70703-0679-45e2-b315-b6397e1acca3"
)

# 환경변수 또는 직접 지정
API_KEY = os.environ.get("PUBLIC_DATA_API_KEY", "YOUR_API_KEY_HERE")

PER_PAGE = 100          # 한 번에 가져올 건수 (최대 1000, 안전하게 100 사용)
REQUEST_DELAY = 0.5     # 요청 간 딜레이 (초)
MAX_RETRIES = 3         # 최대 재시도 횟수
OUTPUT_FILE = "chemical_products.csv"

# CSV 컬럼 매핑 (한글명: API 필드명)
COLUMNS = {
    "상호명":       "CN_NM",
    "제품명":       "PDTNM",
    "신고번호":     "CNS_NO",
    "발급일":       "ISSUDY",
    "신규구분":     "CL",
    "대표구분":     "ST",
    "제형":         "DF_C",
    "제조방식":     "MF_MTHD",
    "제조수입구분": "MF_ICM",
    "제조국가":     "MF_NATION",
    "제조회사":     "MF_CPY",
}

# CSV 헤더 순서 (한글명)
CSV_HEADERS = list(COLUMNS.keys())
# API 필드명 순서
API_FIELDS = list(COLUMNS.values())


# ──────────────────────────────────────────────
# 유틸리티
# ──────────────────────────────────────────────
def log(msg: str) -> None:
    print(f"[INFO] {msg}", flush=True)


def warn(msg: str) -> None:
    print(f"[WARN] {msg}", flush=True)


def error(msg: str) -> None:
    print(f"[ERROR] {msg}", file=sys.stderr, flush=True)


def fetch_page(page: int, per_page: int) -> dict:
    """단일 페이지 API 호출 (재시도 포함)"""
    params = {
        "page": page,
        "perPage": per_page,
        "serviceKey": API_KEY,
        "returnType": "JSON",
    }
    url = BASE_URL + "?" + urllib.parse.urlencode(params)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={"Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
                data = json.loads(raw)
                return data
        except urllib.error.HTTPError as e:
            warn(f"HTTP 오류 {e.code} (시도 {attempt}/{MAX_RETRIES}): {e.reason}")
        except urllib.error.URLError as e:
            warn(f"URL 오류 (시도 {attempt}/{MAX_RETRIES}): {e.reason}")
        except json.JSONDecodeError as e:
            warn(f"JSON 파싱 오류 (시도 {attempt}/{MAX_RETRIES}): {e}")
        except Exception as e:
            warn(f"알 수 없는 오류 (시도 {attempt}/{MAX_RETRIES}): {e}")

        if attempt < MAX_RETRIES:
            sleep_time = 2 ** attempt  # 지수 백오프: 2, 4, 8초
            log(f"{sleep_time}초 후 재시도...")
            time.sleep(sleep_time)

    raise RuntimeError(f"페이지 {page} 수집 실패 (최대 재시도 초과)")


def extract_row(item: dict) -> list:
    """API 응답 항목에서 CSV 행 데이터 추출"""
    return [item.get(field, "") for field in API_FIELDS]


# ──────────────────────────────────────────────
# 메인 수집 로직
# ──────────────────────────────────────────────
def fetch_all_data() -> list[list]:
    """전체 데이터 페이지네이션 수집"""
    if API_KEY == "YOUR_API_KEY_HERE":
        error(
            "API 키가 설정되지 않았습니다.\n"
            "  방법 1) 환경변수: export PUBLIC_DATA_API_KEY='발급받은_키'\n"
            "  방법 2) data_fetch.py 내 API_KEY 변수 직접 수정"
        )
        sys.exit(1)

    log("데이터 수집 시작...")

    # 첫 페이지 호출로 전체 건수 확인
    first_page = fetch_page(1, PER_PAGE)

    # 응답 구조 확인
    if "data" not in first_page:
        error(f"예상치 못한 응답 구조: {list(first_page.keys())}")
        error(f"응답 내용(일부): {str(first_page)[:500]}")
        sys.exit(1)

    total_count = first_page.get("totalCount", 0)
    current_count = first_page.get("currentCount", 0)
    log(f"전체 데이터 건수: {total_count:,}건")

    all_rows = []

    # 첫 페이지 데이터 추가
    for item in first_page["data"]:
        all_rows.append(extract_row(item))

    log(f"  페이지 1 완료 ({len(first_page['data'])}건)")

    # 나머지 페이지 수집
    import math
    total_pages = math.ceil(total_count / PER_PAGE)

    for page in range(2, total_pages + 1):
        time.sleep(REQUEST_DELAY)
        try:
            page_data = fetch_page(page, PER_PAGE)
            items = page_data.get("data", [])
            for item in items:
                all_rows.append(extract_row(item))
            log(f"  페이지 {page}/{total_pages} 완료 ({len(items)}건, 누적: {len(all_rows):,}건)")
        except RuntimeError as e:
            error(str(e))
            warn(f"페이지 {page} 스킵 후 계속 진행...")

    return all_rows


def save_csv(rows: list[list], filepath: str) -> None:
    """수집 데이터를 CSV로 저장"""
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(CSV_HEADERS)   # 한글 헤더
        writer.writerows(rows)
    log(f"CSV 저장 완료: {filepath} ({len(rows):,}행)")


# ──────────────────────────────────────────────
# 진입점
# ──────────────────────────────────────────────
if __name__ == "__main__":
    # 커맨드라인 인자로 API 키 받기 가능
    if len(sys.argv) == 2:
        API_KEY = sys.argv[1]
        log(f"커맨드라인에서 API 키 입력 받음")

    try:
        rows = fetch_all_data()
        if rows:
            save_csv(rows, OUTPUT_FILE)
            log(f"완료! 총 {len(rows):,}건 수집 → {OUTPUT_FILE}")
        else:
            warn("수집된 데이터가 없습니다.")
    except KeyboardInterrupt:
        warn("사용자에 의해 중단됨")
        sys.exit(0)
