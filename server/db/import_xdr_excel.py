"""
Import a DPI-XDR Excel workbook into the HK platform through the REST API.

Usage:
  python server/db/import_xdr_excel.py path/to/xdr.xlsx --api http://localhost:3000/api

The script keeps every original row in `raw_json`, while mapping common fields
into the normalized `dpi_xdr_common` columns on the server.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from pathlib import Path

try:
    import openpyxl
except ImportError as exc:  # pragma: no cover
    raise SystemExit("openpyxl is required: pip install openpyxl") from exc


SHEET_PROTOCOL = {
    "通用话单": "COMMON",
    "http": "HTTP",
    "HTTPS": "HTTPS",
    "DNS": "DNS",
    "FTP": "FTP",
    "EMAIL": "EMAIL",
    "SIP": "SIP",
    "RTSP": "RTSP",
    "Radius": "RADIUS",
    "Coap": "COAP",
}


def unique_headers(headers):
    seen = {}
    result = []
    for idx, header in enumerate(headers):
        name = str(header).strip() if header is not None else f"col_{idx + 1}"
        if not name:
            name = f"col_{idx + 1}"
        count = seen.get(name, 0)
        seen[name] = count + 1
        result.append(name if count == 0 else f"{name}_{count + 1}")
    return result


def workbook_rows(path: Path):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    for ws in wb.worksheets:
        rows = ws.iter_rows(values_only=True)
        try:
            headers = unique_headers(next(rows))
        except StopIteration:
            continue
        protocol = SHEET_PROTOCOL.get(ws.title, ws.title.upper())
        for row in rows:
            if row is None or all(v is None for v in row):
                continue
            item = {headers[i]: row[i] for i in range(min(len(headers), len(row)))}
            item["sheet"] = ws.title
            item["protocol"] = protocol
            yield item


def post_json(url: str, payload: dict):
    data = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--api", default="http://localhost:3000/api")
    parser.add_argument("--batch-size", type=int, default=200)
    args = parser.parse_args(argv)

    if not args.workbook.exists():
        raise SystemExit(f"Workbook not found: {args.workbook}")

    endpoint = args.api.rstrip("/") + "/dpi-xdr/import-json"
    batch = []
    total = success = failed = 0
    for item in workbook_rows(args.workbook):
        batch.append(item)
        if len(batch) >= args.batch_size:
            result = post_json(endpoint, {"source_file": str(args.workbook), "records": batch})
            data = result.get("data") or {}
            total += data.get("total", len(batch))
            success += data.get("success", 0)
            failed += data.get("failed", 0)
            batch = []
    if batch:
        result = post_json(endpoint, {"source_file": str(args.workbook), "records": batch})
        data = result.get("data") or {}
        total += data.get("total", len(batch))
        success += data.get("success", 0)
        failed += data.get("failed", 0)

    print(json.dumps({"total": total, "success": success, "failed": failed}, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1:])
