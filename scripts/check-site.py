"""Validate assets, document IDs and links across every static page."""
from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import urlsplit, unquote

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'site' / 'dist'
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('src', 'href', 'data-image'):
            if attrs.get(key):
                self.refs.append(attrs[key])
pages = {}
for path in root.glob('*.html'):
    page = Page()
    page.feed(path.read_text())
    pages[path.resolve()] = page
refs = 0
for source, page in pages.items():
    for ref in page.refs:
        refs += 1
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = (root / unquote(url.path).lstrip('/')) if url.path.startswith('/') else (source.parent / unquote(url.path))
        target = target.resolve() if url.path else source
        if target.is_dir():
            target /= 'index.html'
        assert target.is_relative_to(root.resolve()), f'Outside public directory: {ref}'
        assert target.is_file(), f'{source.name}: Missing asset: {ref}'
        if url.fragment and target in pages:
            assert url.fragment in pages[target].ids, f'{source.name}: Missing section: {ref}'
assert not (root / 'company_info').exists()
print(f'Site checks passed: {len(pages)} HTML files, {refs} references')
