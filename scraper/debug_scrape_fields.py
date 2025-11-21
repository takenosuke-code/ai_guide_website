#!/usr/bin/env python3
import os
import json
import re
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('WP_URL', '').rstrip('/')
user = os.getenv('WP_USERNAME')
password = os.getenv('WP_PASSWORD', '').replace(' ', '').strip()

session = requests.Session()
session.auth = HTTPBasicAuth(user, password)
session.headers.update({'User-Agent': 'FieldCheck/1.0'})

resp = session.get(f"{url}/wp-json/wp/v2/posts/15", timeout=10)
print('Status:', resp.status_code)
data = resp.json()

pattern = re.compile('scrape', re.I)

print('\nFields containing "scrape":')

def scan(obj, prefix='root'):
    if isinstance(obj, dict):
        for k, v in obj.items():
            path = f"{prefix}.{k}"
            if pattern.search(k):
                print(path, ':', v)
            scan(v, path)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            scan(v, f"{prefix}[{i}]")

scan(data)
