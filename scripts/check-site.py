"""Validate local assets and section links before deployment."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1] / 'site' / 'dist'
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
        for key in ('src', 'href'):
            if key in attrs:
                self.refs.append(attrs[key])
page = Page()
page.feed((root / 'index.html').read_text())
for ref in page.refs:
    url = urlsplit(ref)
    if url.scheme or url.netloc:
        continue
    if url.path:
        path = (root / unquote(url.path).lstrip('/')).resolve()
        assert path.is_relative_to(root.resolve()), f'Outside public directory: {ref}'
        assert path.is_file(), f'Missing asset: {ref}'
    elif url.fragment:
        assert url.fragment in page.ids, f'Missing section: {ref}'
assert 'company_info' not in {p.name for p in root.iterdir()}
print(f'Site checks passed: {len(page.refs)} references, {len(page.ids)} IDs')
