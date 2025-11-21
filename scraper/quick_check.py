import requests, os, json
from dotenv import load_dotenv
load_dotenv()
s = requests.Session()
s.auth = (os.getenv('WP_USERNAME'), os.getenv('WP_PASSWORD'))
url = os.getenv('WP_URL')
# Try built-in endpoint
r = s.get(f"{url}/wp-json/wp/v2/posts/15")
data = r.json()
if 'acf' in data:
    acf = data['acf']
    print('latest_version:', acf.get('latest_version', 'NOT FOUND') or 'EMPTY')
    print('latest_update:', acf.get('latest_update', 'NOT FOUND') or 'EMPTY')
    overview = acf.get('overview', '')
    print('overview (first 50 chars):', overview[:50] if overview else 'EMPTY')
else:
    print('No ACF in response. Keys:', list(data.keys())[:10])

