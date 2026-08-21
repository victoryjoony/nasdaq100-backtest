"""
Refreshes the embedded QQQ price history for the QQQ Leverage Lab site.

Usage: python update.py
Reads template.html (with a __QQQ_DATA__ placeholder), fetches the latest
QQQ daily adjusted-close series from Yahoo Finance, and writes index.html
ready to be committed and pushed (GitHub Pages serves it directly).
"""
import json
import urllib.request
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, 'template.html')
OUTPUT_PATH = os.path.join(BASE_DIR, 'index.html')

YAHOO_URL = (
    'https://query1.finance.yahoo.com/v8/finance/chart/QQQ'
    '?range=30y&interval=1d&events=div%2Csplits'
)


def fetch_qqq_data():
    req = urllib.request.Request(
        YAHOO_URL,
        headers={
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
            )
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)

    result = data['chart']['result'][0]
    timestamps = result['timestamp']
    adjclose = result['indicators']['adjclose'][0]['adjclose']

    rows = {}
    for ts, adj in zip(timestamps, adjclose):
        if adj is None:
            continue
        date_str = __import__('datetime').datetime.utcfromtimestamp(ts).strftime('%Y-%m-%d')
        rows[date_str] = round(adj, 4)

    return sorted(rows.items())


def main():
    rows = fetch_qqq_data()
    if len(rows) < 100:
        raise RuntimeError(f'Suspiciously few rows fetched ({len(rows)}); aborting to avoid publishing bad data.')

    with open(TEMPLATE_PATH, encoding='utf-8') as f:
        template = f.read()

    data_json = json.dumps(rows, separators=(',', ':'))
    out = template.replace('__QQQ_DATA__', data_json)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(out)

    print(f'Wrote {OUTPUT_PATH} ({len(out.encode("utf-8"))} bytes), {len(rows)} rows, '
          f'range {rows[0][0]} .. {rows[-1][0]}')


if __name__ == '__main__':
    main()
