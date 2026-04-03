import json, base64, urllib.request, os, time

API_KEY = os.environ.get('GEMINI_API_KEY', '')
if not API_KEY:
    print('ERROR: Set GEMINI_API_KEY environment variable')
    exit(1)
URL = f'https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key={API_KEY}'
OUT = 'images/evidence'
REF = 'images/reference'

ANTI_SLOP = "Shot on real camera with slight film grain, natural imperfections, not too clean or perfect, slight dust and wear visible, hyperrealistic documentary photography style. No artificial smoothness. No AI artifacts. Real texture, real light, real grit."

def gen(out_name, prompt, ref_file=None):
    out_path = f'{OUT}/{out_name}.jpg'
    if os.path.exists(out_path):
        print(f'SKIP {out_name}')
        return True
    parts = []
    if ref_file and os.path.exists(f'{REF}/{ref_file}'):
        with open(f'{REF}/{ref_file}', 'rb') as f:
            parts.append({'inlineData': {'mimeType': 'image/jpeg', 'data': base64.b64encode(f.read()).decode()}})
    parts.append({'text': prompt})
    payload = json.dumps({'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE', 'TEXT']}}).encode()
    req = urllib.request.Request(URL, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.loads(r.read())
        if 'error' in data:
            print(f'FAIL {out_name}: {data["error"].get("message","")[:120]}')
            return False
        for p in data.get('candidates', [{}])[0].get('content', {}).get('parts', []):
            if 'inlineData' in p:
                img = base64.b64decode(p['inlineData']['data'])
                with open(out_path, 'wb') as f:
                    f.write(img)
                print(f'DONE {out_name} ({len(img):,}b)')
                return True
        print(f'FAIL {out_name}: no img')
        return False
    except Exception as e:
        print(f'FAIL {out_name}: {e}')
        return False

images = [
    ('c1-p02-opening-night', 'old-theatre.jpg',
     f'Hyperrealistic photograph of a small-town theatre lobby after a performance, 1987. Playbill programs for A Dolls House on a table. Dim warm wall sconces. Art deco details. Coat check counter with numbered hooks, stub 47 circled in red by investigators. Period 1987 carpet and furnishings. Evidence photograph taken by police. {ANTI_SLOP}'),

    ('c1-p03-the-husband', 'police-file.jpg',
     f'Hyperrealistic photograph of a 1987 real estate developers home office during a police search. Dark mahogany desk with phone, Rolodex, framed family photo face-down. Filing cabinet drawer pulled open with manila folders. Legal pad with columns of numbers. Ashtray with half-smoked cigar. Flash photography, harsh direct light, evidence markers visible. {ANTI_SLOP}'),

    ('c1-p04-the-headlines', None,
     f'Hyperrealistic close-up of a 1987 small-town newspaper front page. Headline: LOCAL WOMAN MISSING AFTER THEATRE VISIT. Below: HUSBAND ISSUES PUBLIC PLEA. Ashford Daily Herald, January 16, 1987. Yellowed with age, torn at fold, on a kitchen table with coffee mug. Morning window light. Visible newsprint dot matrix texture. {ANTI_SLOP}'),

    ('c1-p05-other-man', 'handwritten-letter.jpg',
     f'Hyperrealistic photograph of two handwritten love letters on dark surface overlapping. One in elegant feminine handwriting on cream stationery, the other angular masculine on white paper. Dried rose petal between them. Photographed as police evidence, flat overhead with evidence ruler at edge. Fluorescent evidence photography lighting. Genuine and personal. {ANTI_SLOP}'),

    ('c1-p06-the-bridge', 'bridge-fog.jpg',
     f'Hyperrealistic crime scene photograph of a small-town iron bridge, January 1987. Navy peacoat draped over railing. Yellow police tape. Evidence markers numbered 1-4 along bridge deck. Detective in long coat at far end taking notes. Cold winter morning, bare trees, frost on metal. Shot on Nikon F3 with Kodak film, visible grain. {ANTI_SLOP}'),

    ('c1-p07-follow-money', 'financial-ledger.jpg',
     f'Hyperrealistic photograph of financial documents spread on desk as evidence. Bank statements from First Pacific Bank showing highlighted wire transfers totaling $340,000. Yellow legal pad with notes: Cascade Holdings LLC shell company Victor Hargrove director. Red circles around key transactions. Police evidence room fluorescent light. {ANTI_SLOP}'),

    ('c1-p08-groundskeeper', None,
     f'Hyperrealistic photograph of a groundskeepers cottage at edge of wooded estate, winter 1987. Small weathered wooden structure with single lit window. Muddy path to front door. Firewood stacked on side. Old pickup truck parked nearby. Shot at dusk, estate main house visible in far background. Cold isolated atmosphere. Where Thomas Brewer heard arguing at 1:15 AM. {ANTI_SLOP}'),

    ('c1-p09-eleanors-secret', 'safe-deposit.jpg',
     f'Hyperrealistic overhead photograph of safe deposit box contents on dark evidence cloth. Items: sealed cream envelope marked INSURANCE, leather diary with brass clasp, brass key, folded newspaper clipping, torn paper with coded cipher letters. Each item has numbered evidence tag. Under harsh evidence room fluorescent light with evidence ruler for scale. {ANTI_SLOP}'),

    ('c1-p10-the-brother', 'construction-site.jpg',
     f'Hyperrealistic photograph of a construction site in small Oregon town, 1987. Foundation trench being dug, concrete forms visible. Faded sign reads ASHFORD COMMONS HARGROVE DEVELOPMENT SPRING 1987. Heavy machinery, muddy ground, overcast sky. Photographed from across street. The site where Eleanor was buried under the foundation. {ANTI_SLOP}'),

    ('c1-p11-anonymous-tip', None,
     f'Hyperrealistic photograph of an anonymous letter in a clear police evidence bag on modern desk. Plain white paper with printed text: The truth is under Ashford Commons. She never left that night. Look where he built over her. Blue nitrile forensic gloves beside it. Modern 2024 LED office lighting. Contemporary evidence photograph. {ANTI_SLOP}'),

    ('c1-p12-case-closed', None,
     f'Hyperrealistic photograph of a complete cold case evidence board at police station, 2024. Corkboard covered with photographs, red string connecting suspects, newspaper clippings, timeline across bottom. One suspects photo circled in red with ARRESTED written below. Missing person photo in center. Full story of investigation visible. Police station fluorescent lighting, institutional walls. {ANTI_SLOP}'),
]

for name, ref, prompt in images:
    gen(name, prompt, ref)
    time.sleep(7)

print('\n=== CASE 1 ALL PACKETS DONE ===')
