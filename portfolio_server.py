#!/usr/bin/env python3
"""Scan the media folders and serve this portfolio locally (no dependencies)."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, urlsplit
import argparse, json, re, threading, webbrowser, os
ROOT = Path(__file__).resolve().parent
IMAGES = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'}
VIDEOS = {'.mp4', '.webm', '.mov', '.m4v'}
FOLDERS = {'VFX': ('VFX-Photos', 'VFX-Videos'), 'Models': ('Modelling-Photos', 'Modelling-Videos'), 'Misc': ('Misc-Photos', 'Misc-Videos')}
LOCK = threading.Lock()
def title(path):
    name = path.name
    while Path(name).suffix.lower() in IMAGES | VIDEOS:
        name = Path(name).stem
    return name

def media_list():
    result = {}
    old = {}
    manifest = ROOT / 'portfolio-media.js'
    if manifest.exists():
        try: old = json.loads(manifest.read_text().split('window.PORTFOLIO_MEDIA =', 1)[1].strip().rstrip(';'))
        except (ValueError, IndexError): pass
    for category, (photos, videos) in FOLDERS.items():
        photo_dir, video_dir = ROOT / photos, ROOT / videos
        if category == 'Misc' and not photo_dir.exists():
            result[category] = old.get(category, [])
            continue
        video_map = {}
        for directory in [video_dir, ROOT / 'Videos']:
            if directory.is_dir():
                for p in sorted(directory.iterdir()):
                    if p.is_file() and p.suffix.lower() in VIDEOS:
                        video_map.setdefault(title(p).casefold(), quote(p.relative_to(ROOT).as_posix(), safe='/'))
        items = []
        if photo_dir.is_dir():
            for p in sorted(photo_dir.iterdir(), key=lambda p:p.name.casefold()):
                if p.is_file() and p.suffix.lower() in IMAGES:
                    name = title(p)
                    items.append({'name':name, 'image':quote(p.relative_to(ROOT).as_posix(), safe='/'), 'video':video_map.get(name.casefold(), '')})
        previous_order = {x['name']:i for i,x in enumerate(old.get(category, []))}
        items.sort(key=lambda x:(previous_order.get(x['name'], 100000),x['name'].casefold()))
        order_file = ROOT / (category + '-Order.txt')
        if order_file.is_file():
            names = [line.strip().casefold() for line in order_file.read_text(encoding='utf-8-sig').splitlines() if line.strip() and not line.lstrip().startswith('#')]
            order = {}
            for name in names:
                order.setdefault(name, len(order))
            items.sort(key=lambda item: order.get(item['name'].casefold(), len(order)))
        result[category] = items
    return result

def refresh():
    with LOCK:
        data = media_list()
        content = '// Automatically generated from media folders by portfolio_server.py.\nwindow.PORTFOLIO_MEDIA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
        dest = ROOT / 'portfolio-media.js'
        if not dest.exists() or dest.read_text() != content:
            temp = ROOT / '.portfolio-media.tmp'
            temp.write_text(content)
            os.replace(temp, dest)
        return data

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if urlsplit(self.path).path == '/__portfolio_media':
            payload = json.dumps(refresh(), ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if urlsplit(self.path).path in ['/', '/index.html', '/portfolio-media.js']: refresh()
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        super().end_headers()

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--scan-only',action='store_true')
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--no-open',action='store_true')
    args=parser.parse_args()
    data=refresh()
    print('Media:', ', '.join(f'{key}: {len(items)}' for key,items in data.items()))
    if not args.scan_only:
        server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
        address=f'http://127.0.0.1:{args.port}/'
        print(f'Portfolio: {address}\nAdd media to the folders, then refresh your browser. Close this window to stop.')
        if not args.no_open: webbrowser.open(address)
        try: server.serve_forever()
        except KeyboardInterrupt: pass
        finally: server.server_close()
