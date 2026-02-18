#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
생활화학제품 신고증명서 발급 현황 분석 스크립트
chemical_products.csv 를 불러와 5가지 분석 수행

분석 1) 제조방식별 신고 건수
분석 2) ODM 업체 TOP 20
분석 3) 연도별 신규 신고 트렌드
분석 4) 수입 제품 제조국가 분포 TOP 10
분석 5) Church & Dwight 관련 신고 현황
"""

import csv
import sys
import json
import os
from collections import Counter
from datetime import datetime

CSV_FILE = "chemical_products.csv"
RESULT_FILE = "result_summary.txt"

# ──────────────────────────────────────────────
# 데이터 로드
# ──────────────────────────────────────────────

def load_csv(filepath: str) -> list[dict]:
    """CSV 파일을 딕셔너리 리스트로 로드"""
    if not os.path.exists(filepath):
        print(f"[ERROR] 파일이 없습니다: {filepath}")
        print("  먼저 data_fetch.py를 실행하여 데이터를 수집하세요.")
        sys.exit(1)

    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"[INFO] 데이터 로드 완료: {len(rows):,}건 ({filepath})")
    return rows


# ──────────────────────────────────────────────
# 분석 함수
# ──────────────────────────────────────────────

def analysis_1_manufacturing_method(rows: list[dict]) -> dict:
    """분석 1: 제조방식별 신고 건수"""
    method_labels = {
        "direct": "직접제조(direct)",
        "oem":    "OEM",
        "odm":    "ODM",
        "etc":    "기타(etc)",
        "suib":   "수입(suib)",
    }

    counter = Counter()
    for row in rows:
        mf = (row.get("제조방식") or row.get("MF_MTHD") or "").strip().lower()
        counter[mf] += 1

    result = {}
    for key, label in method_labels.items():
        result[label] = counter.get(key, 0)

    # 정의되지 않은 값 처리
    known = set(method_labels.keys())
    for key, cnt in counter.items():
        if key not in known:
            result[f"기타미분류({key or 'blank'})"] = cnt

    return result


def analysis_2_odm_top20(rows: list[dict]) -> tuple[list[tuple], bool]:
    """분석 2: ODM 업체 TOP 20 및 티앤엘 포함 여부"""
    odm_rows = [
        r for r in rows
        if (r.get("제조방식") or r.get("MF_MTHD") or "").strip().lower() == "odm"
    ]

    counter = Counter()
    for row in odm_rows:
        company = (row.get("상호명") or row.get("CN_NM") or "").strip()
        if company:
            counter[company] += 1

    top20 = counter.most_common(20)

    # 티앤엘(T&L) 포함 여부 확인
    tnl_keywords = ["티앤엘", "t&l", "t&amp;l", "ttnl"]
    tnl_included = any(
        any(kw in company.lower() for kw in tnl_keywords)
        for company, _ in top20
    )

    return top20, tnl_included


def analysis_3_yearly_trend(rows: list[dict]) -> dict:
    """분석 3: 연도별 신규(register) 신고 트렌드"""
    register_keywords = ["register", "신규", "new", "r"]

    yearly = Counter()
    for row in rows:
        cl = (row.get("신규구분") or row.get("CL") or "").strip().lower()
        issudy = (row.get("발급일") or row.get("ISSUDY") or "").strip()

        # 신규 여부 판단 (CL 값이 register 계열인 경우)
        is_new = any(kw in cl for kw in register_keywords) or cl == "r"

        if not is_new:
            continue

        # 연도 추출 (YYYYMMDD 또는 YYYY-MM-DD 또는 YYYY/MM/DD 형식 지원)
        year = None
        for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d"):
            try:
                year = datetime.strptime(issudy, fmt).year
                break
            except ValueError:
                pass

        if year is None and len(issudy) >= 4:
            try:
                year = int(issudy[:4])
                if not (2000 <= year <= 2030):
                    year = None
            except ValueError:
                pass

        if year:
            yearly[year] += 1

    # 연도 오름차순 정렬
    return dict(sorted(yearly.items()))


def analysis_4_import_countries(rows: list[dict]) -> list[tuple]:
    """분석 4: 수입 제품 제조국가 분포 TOP 10"""
    import_rows = [
        r for r in rows
        if (r.get("제조수입구분") or r.get("MF_ICM") or "").strip().lower() == "suib"
    ]

    counter = Counter()
    for row in import_rows:
        nation = (row.get("제조국가") or row.get("MF_NATION") or "").strip()
        nation = nation if nation else "(미기재)"
        counter[nation] += 1

    return counter.most_common(10)


def analysis_5_church_dwight(rows: list[dict]) -> list[dict]:
    """분석 5: Church & Dwight 관련 신고 현황"""
    keywords = ["church", "dwight", "arm"]

    matched = []
    for row in rows:
        cn_nm = (row.get("상호명") or row.get("CN_NM") or "").lower()
        if any(kw in cn_nm for kw in keywords):
            matched.append(row)

    return matched


# ──────────────────────────────────────────────
# 출력 / 저장
# ──────────────────────────────────────────────

def print_separator(title: str = "") -> None:
    line = "=" * 60
    if title:
        print(f"\n{line}")
        print(f"  {title}")
        print(line)
    else:
        print(line)


def format_analysis_1(result: dict) -> str:
    lines = ["[분석 1] 제조방식별 신고 건수", "-" * 40]
    total = sum(result.values())
    for label, cnt in sorted(result.items(), key=lambda x: -x[1]):
        pct = cnt / total * 100 if total else 0
        lines.append(f"  {label:<20}: {cnt:>6,}건  ({pct:.1f}%)")
    lines.append(f"  {'합계':<20}: {total:>6,}건")
    return "\n".join(lines)


def format_analysis_2(top20: list[tuple], tnl_included: bool) -> str:
    lines = ["[분석 2] ODM 업체 TOP 20", "-" * 40]
    for i, (company, cnt) in enumerate(top20, 1):
        marker = "  ← 티앤엘(T&L)" if any(
            kw in company.lower() for kw in ["티앤엘", "t&l", "ttnl"]
        ) else ""
        lines.append(f"  {i:>2}. {company:<30} {cnt:>5,}건{marker}")
    lines.append(f"\n  티앤엘(T&L) TOP 20 포함 여부: {'✓ 포함' if tnl_included else '✗ 미포함'}")
    return "\n".join(lines)


def format_analysis_3(yearly: dict) -> str:
    lines = ["[분석 3] 연도별 신규 신고 트렌드 (register 기준)", "-" * 40]
    if not yearly:
        lines.append("  데이터 없음 (신규구분 값 확인 필요)")
    else:
        max_cnt = max(yearly.values())
        for year, cnt in yearly.items():
            bar_len = int(cnt / max_cnt * 30)
            bar = "█" * bar_len
            lines.append(f"  {year}: {bar:<30} {cnt:>5,}건")
    return "\n".join(lines)


def format_analysis_4(top10: list[tuple]) -> str:
    lines = ["[분석 4] 수입 제품 제조국가 TOP 10", "-" * 40]
    total = sum(cnt for _, cnt in top10)
    for i, (nation, cnt) in enumerate(top10, 1):
        pct = cnt / total * 100 if total else 0
        lines.append(f"  {i:>2}. {nation:<20} {cnt:>5,}건  ({pct:.1f}%)")
    return "\n".join(lines)


def format_analysis_5(matched: list[dict]) -> str:
    lines = [
        "[분석 5] Church & Dwight 관련 신고 현황",
        f"         (키워드: church / dwight / arm)",
        "-" * 40,
    ]
    if not matched:
        lines.append("  해당 레코드 없음")
    else:
        lines.append(f"  총 {len(matched)}건 발견\n")
        # 컬럼 헤더
        headers = ["상호명", "제품명", "신고번호", "발급일", "제조방식", "제조수입구분", "제조국가"]
        header_line = "  " + " | ".join(f"{h:<20}" for h in headers)
        lines.append(header_line)
        lines.append("  " + "-" * (len(header_line) - 2))

        for row in matched:
            vals = [
                (row.get("상호명") or row.get("CN_NM") or "")[:20],
                (row.get("제품명") or row.get("PDTNM") or "")[:20],
                (row.get("신고번호") or row.get("CNS_NO") or "")[:20],
                (row.get("발급일") or row.get("ISSUDY") or "")[:20],
                (row.get("제조방식") or row.get("MF_MTHD") or "")[:20],
                (row.get("제조수입구분") or row.get("MF_ICM") or "")[:20],
                (row.get("제조국가") or row.get("MF_NATION") or "")[:20],
            ]
            lines.append("  " + " | ".join(f"{v:<20}" for v in vals))
    return "\n".join(lines)


# ──────────────────────────────────────────────
# 대시보드 데이터 생성 (dashboard.html에서 사용)
# ──────────────────────────────────────────────

def save_dashboard_data(
    a1: dict,
    a2_top20: list[tuple],
    a2_tnl: bool,
    a3: dict,
    a4: list[tuple],
    a5: list[dict],
) -> None:
    """분석 결과를 dashboard_data.json으로 저장 (dashboard.html에서 읽음)"""
    data = {
        "manufacturing_method": {k: v for k, v in a1.items()},
        "odm_top20": [{"company": c, "count": n} for c, n in a2_top20],
        "odm_tnl_included": a2_tnl,
        "yearly_trend": {str(k): v for k, v in a3.items()},
        "import_countries": [{"nation": n, "count": c} for n, c in a4],
        "church_dwight_count": len(a5),
        "church_dwight_records": [
            {
                "상호명":       (r.get("상호명") or r.get("CN_NM") or ""),
                "제품명":       (r.get("제품명") or r.get("PDTNM") or ""),
                "신고번호":     (r.get("신고번호") or r.get("CNS_NO") or ""),
                "발급일":       (r.get("발급일") or r.get("ISSUDY") or ""),
                "제조방식":     (r.get("제조방식") or r.get("MF_MTHD") or ""),
                "제조수입구분": (r.get("제조수입구분") or r.get("MF_ICM") or ""),
                "제조국가":     (r.get("제조국가") or r.get("MF_NATION") or ""),
            }
            for r in a5
        ],
    }

    with open("dashboard_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[INFO] 대시보드 데이터 저장: dashboard_data.json")


# ──────────────────────────────────────────────
# 메인
# ──────────────────────────────────────────────

def main():
    rows = load_csv(CSV_FILE)

    print_separator("생활화학제품 신고증명서 발급 현황 분석 결과")

    # 분석 실행
    a1 = analysis_1_manufacturing_method(rows)
    a2_top20, a2_tnl = analysis_2_odm_top20(rows)
    a3 = analysis_3_yearly_trend(rows)
    a4 = analysis_4_import_countries(rows)
    a5 = analysis_5_church_dwight(rows)

    # 포맷된 결과 출력
    sections = [
        format_analysis_1(a1),
        format_analysis_2(a2_top20, a2_tnl),
        format_analysis_3(a3),
        format_analysis_4(a4),
        format_analysis_5(a5),
    ]

    output_lines = []
    output_lines.append(f"생활화학제품 신고증명서 발급 현황 분석 결과")
    output_lines.append(f"분석일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    output_lines.append(f"총 데이터 건수: {len(rows):,}건")
    output_lines.append("=" * 60)

    for section in sections:
        print()
        print(section)
        output_lines.append("")
        output_lines.append(section)

    print_separator()

    # result_summary.txt 저장
    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    print(f"\n[INFO] 분석 결과 저장: {RESULT_FILE}")

    # 대시보드용 JSON 저장
    save_dashboard_data(a1, a2_top20, a2_tnl, a3, a4, a5)

    print("\n[완료] 모든 분석이 완료되었습니다.")
    print(f"       - {RESULT_FILE} : 텍스트 결과")
    print(f"       - dashboard_data.json : 대시보드 데이터")
    print(f"       - dashboard.html 을 브라우저에서 열어 시각화를 확인하세요.")


if __name__ == "__main__":
    main()
