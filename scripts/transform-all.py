"""
Transform all 36 real reference images through Gemini (Nano Banana Pro)
image-to-image pipeline. Each image gets case-specific context baked in.
Anti-slop: specify real camera types, film grain, imperfections, mixed quality sources.
"""
import json, base64, urllib.request, os, time

API_KEY = 'AIzaSyDlvzI8RUCYqnlBcfMFAuRn4o8OxlpKLxQ'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key={API_KEY}'
RAW = 'images/raw'
OUT = 'images/evidence'
os.makedirs(OUT, exist_ok=True)

def transform(raw_name, out_name, prompt):
    out_path = f'{OUT}/{out_name}.jpg'
    if os.path.exists(out_path):
        print(f'SKIP {out_name}')
        return True
    raw_path = f'{RAW}/{raw_name}.jpg'
    if not os.path.exists(raw_path):
        print(f'MISS {raw_name}')
        return False
    with open(raw_path, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode()
    payload = json.dumps({
        'contents': [{'parts': [
            {'inlineData': {'mimeType': 'image/jpeg', 'data': img_b64}},
            {'text': prompt}
        ]}],
        'generationConfig': {'responseModalities': ['IMAGE', 'TEXT']}
    }).encode()
    req = urllib.request.Request(URL, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.loads(r.read())
        if 'error' in data:
            print(f'FAIL {out_name}: {data["error"].get("message","")[:150]}')
            return False
        for p in data.get('candidates', [{}])[0].get('content', {}).get('parts', []):
            if 'inlineData' in p:
                img = base64.b64decode(p['inlineData']['data'])
                with open(out_path, 'wb') as f:
                    f.write(img)
                print(f'DONE {out_name} ({len(img):,}b)')
                return True
        print(f'FAIL {out_name}: no image returned')
        return False
    except Exception as e:
        print(f'FAIL {out_name}: {e}')
        return False

# ============================================================
# CASE 1: THE HARGROVE DISAPPEARANCE — Ashford, Oregon, 1987
# ============================================================
CASE1 = [
    ('c1-p01', 'c1-p01-case-reopens',
     'Transform this into a hyperrealistic 1987 police case file photograph. Make it a missing persons report on a worn police desk stamped CASE CLOSED in red and REOPENED in blue. Yellowed paper, coffee ring stain, shot under harsh fluorescent office light. Nikon F3 on Kodak Tri-X film, visible grain. This is real evidence.'),

    ('c1-p02', 'c1-p02-opening-night',
     'Transform this into the Monarch Theatre in Ashford Oregon, opening night January 14 1987. Show the lobby after a performance of A Dolls House. Playbills visible. Coat check counter in background. Period 1987 decor. Shot on a point-and-shoot camera by a theatre employee. Slightly amateur framing, flash bounce off walls. Real snapshot quality, not professional.'),

    ('c1-p03', 'c1-p03-the-husband',
     'Transform this into a 1987 press photograph of a real estate developer making a public plea outside his home. He looks distressed but composed. Microphones in front of him. Winter coat. Shot by a newspaper photographer on 35mm film. Slight motion blur on one hand. Visible film grain, slightly warm color cast from the 1980s print. CLUE: his watch shows 2:15 PM.'),

    ('c1-p04', 'c1-p04-the-headlines',
     'Transform this into the front page of the Ashford Daily Herald dated January 16, 1987. Headline: LOCAL WOMAN MISSING AFTER THEATRE VISIT. Subhead: Husband Issues Public Plea. Real newsprint texture with dot matrix printing visible. The paper is yellowed with age, creased at the fold, sitting on a kitchen table next to a coffee mug. Morning window light. Hyperrealistic aged newspaper.'),

    ('c1-p05', 'c1-p05-the-other-man',
     'Transform these into two love letters photographed as police evidence on a dark surface. One in elegant feminine handwriting on cream stationery, the other in angular masculine hand. A dried flower pressed between them. Evidence ruler at the edge of frame. Overhead forensic photography, flat harsh fluorescent light. These are real intercepted letters between Eleanor and Daniel.'),

    ('c1-p06', 'c1-p06-the-bridge',
     'Transform this bridge into Morrison Creek Bridge, Ashford Oregon, January 15 1987 at dawn. A navy peacoat is draped over the iron railing. Yellow police tape. Evidence markers on the ground. A detective in a long coat stands at the far end. Frost on the metal. Shot by the crime scene unit on Nikon F3, Kodak film. Cold blue-grey dawn light. Real crime scene photograph.'),

    ('c1-p07', 'c1-p07-follow-the-money',
     'Transform these into bank statements and financial documents photographed as evidence. Show First Pacific Bank letterhead with highlighted wire transfers. A yellow legal pad with handwritten detective notes about shell companies. Red circles around suspicious transactions totaling $340,000. Harsh evidence room fluorescent lighting. Shot on a department-issue digital camera, slightly flat color.'),

    ('c1-p08', 'c1-p08-the-groundskeeper',
     'Transform this into a groundskeepers cottage on the Hargrove estate, winter 1987. Small weathered wooden building, single lit window, muddy path, firewood stacked on side. Old pickup truck nearby. Shot at dusk by a detective with a handheld point-and-shoot camera. Slightly blurry, flash too weak for the distance. The cottage where Thomas Brewer heard arguing at 1:15 AM.'),

    ('c1-p09', 'c1-p09-eleanors-secret',
     'Transform this into an evidence photograph of safe deposit box contents laid out on dark cloth. Items: sealed envelope marked INSURANCE, small leather diary, brass key, folded newspaper clipping, paper with coded cipher text. Each item has a numbered evidence tag. Shot from directly above under harsh evidence room light with a ruler for scale. Clinical forensic documentation.'),

    ('c1-p10', 'c1-p10-the-brother',
     'Transform this into Ashford Commons construction site, January 1987. Foundation trench being dug. A sign reads ASHFORD COMMONS - A HARGROVE DEVELOPMENT. Muddy ground, overcast Oregon winter sky. Shot from across the street by a detective doing surveillance. Grainy telephoto lens, slightly compressed perspective. CLUE: construction permit date on sign reads January 20, 1987 - 6 days after Eleanor vanished.'),

    ('c1-p11', 'c1-p11-anonymous-tip',
     'Transform this into a modern 2024 evidence photograph. An anonymous typed letter in a clear plastic evidence bag on a police desk. The letter reads: She is under the foundation. Blue nitrile gloves beside it. Modern LED office lighting. Shot on an iPhone 15 by a detective. Clean, sharp, modern forensic documentation. Timestamp metadata visible in corner.'),

    ('c1-p12', 'c1-p12-case-closed',
     'Transform this into a completed police investigation board photographed in 2024. Corkboard covered with photographs connected by red string, newspaper clippings, a timeline across the bottom. One suspect photo circled in red with ARRESTED written below. A missing persons photo in the center. Shot on an iPhone by a detective sharing the result. Slightly off-angle, real snapshot quality.'),
]

# ============================================================
# CASE 2: THE BELMONT HOTEL FIRE — Charleston, SC, 1993
# ============================================================
CASE2 = [
    ('c2-p01', 'c2-p01-fire-at-belmont',
     'Transform this hotel into the Belmont Hotel in Charleston South Carolina on the night of October 17 1993. Fourth floor windows glow orange from fire. Fire truck red lights reflect off wet street. Spanish moss on oak trees. Shot by a bystander on a disposable 35mm camera. Slightly blurry, off-center composition, harsh flash in foreground. Real amateur emergency photograph.'),

    ('c2-p02', 'c2-p02-the-night-of',
     'Transform this hotel hallway into the 4th floor of the Belmont Hotel after the fire, 1993. Soot-stained walls, water damage on carpet, yellow crime scene tape across one doorway. Harsh portable work lights creating stark shadows. Shot by a fire investigator on department-issue camera. Evidence marker with number 3 on the floor. Real forensic scene documentation.'),

    ('c2-p03', 'c2-p03-the-victim',
     'Transform this into a professional portrait of Marcus Webb, 58, hotel owner, taken for a business magazine circa 1991. Distinguished older man in a suit, standing in a hotel lobby. Warm professional studio lighting. This photo would be used by newspapers after his death. Shot on medium format film. Formal, composed, successful businessman. CLUE: no cigarette or ashtray anywhere visible.'),

    ('c2-p04', 'c2-p04-the-headlines',
     'Transform this newspaper into the Charleston Post and Courier, October 19 1993. Headline: HOTEL OWNER PERISHES IN BELMONT BLAZE. Subhead: Fourth Floor Fire Claims Life of Marcus Webb, 58. Real 1993 newspaper layout with columns, black and white photograph of the hotel. Newsprint texture, slightly yellowed with age. Coffee ring on the corner.'),

    ('c2-p05', 'c2-p05-origin-point',
     'Transform this fire image into forensic documentation of Room 416 at the Belmont Hotel after the fire. Charred walls, melted fixtures, but a glass tumbler on the nightstand survived intact with amber liquid residue. A forensic investigator in white hazmat suit photographs the scene. Evidence markers visible. Two separate burn origin points marked with flags. Shot on department camera with harsh flash. Real arson investigation photo.'),

    ('c2-p06', 'c2-p06-the-partner',
     'Transform this into a 1993 photograph of two business partners at a Charleston restaurant. Gerald Tate, 52, old money Charleston, and Marcus Webb reviewing documents over dinner. Shot by a restaurant photographer, slightly formal but candid. Warm ambient restaurant lighting. 35mm film, slight grain. CLUE: Gerald checking his watch. Professional but real.'),

    ('c2-p07', 'c2-p07-the-alibi',
     'Transform this gala scene into the Charleston Yacht Club charity gala, October 17 1993. Formal black-tie event, chandeliers, well-dressed Southern society. Shot by the event photographer. CLUE: timestamp on the edge reads 9:42 PM - three minutes before Gerald Tate left through the kitchen. 35mm film, warm tungsten lighting, slight motion blur from dancing couples.'),

    ('c2-p08', 'c2-p08-night-manager',
     'Transform this security camera into a real 1993 CCTV still from the Belmont Hotel. Black and white, scan lines, timestamp reading 10-17-93 21:38:47 in the corner. A figure in a dark suit walking quickly down a hallway toward a stairwell. Grainy, low resolution, typical 1993 surveillance quality. Green-tint CRT monitor photographed with a Polaroid camera. Real CCTV evidence.'),

    ('c2-p09', 'c2-p09-second-look',
     'Transform this pharmacy image into evidence documentation of prescription records from a Savannah pharmacy, 1993. A receipt and a prescription bottle photographed on an evidence table. The prescription label is partially visible. A toxicology lab report sits beside it showing chemical analysis results. Harsh fluorescent evidence room light. Department camera, slightly flat exposure. Medical forensic documentation.'),

    ('c2-p10', 'c2-p10-loose-threads',
     'Transform this into a dry cleaning receipt photographed as evidence. A small receipt from a Charleston dry cleaner dated October 19 1993. Handwritten note by the clerk: smoke odor on tuxedo jacket - customer said non-smoking event. Shot flat on an evidence table with ruler for scale. iPhone photograph by a cold case detective in 2024 reviewing old evidence. Modern lighting on old receipt.'),

    ('c2-p11', 'c2-p11-the-books',
     'Transform these financial documents into the Belmont Hotels internal ledger books opened to suspicious entries. Columns of numbers with certain figures highlighted in yellow. A separate decoded sheet sits beside the ledger showing offshore account numbers. A magnifying glass rests on the page. Shot in a forensic accounting lab under controlled lighting. Clinical documentation of financial fraud evidence.'),

    ('c2-p12', 'c2-p12-case-closed',
     'Transform this into a courtroom sketch or press photograph from Gerald Tates 2024 arraignment. A well-dressed older man seated at a defense table, head slightly bowed. Shot by a courthouse press photographer through a courtroom door window. Slightly telephoto compression, shallow depth of field. The end of the case. Modern digital camera quality.'),
]

# ============================================================
# CASE 3: THE LIGHTHOUSE KEEPERS WIFE — Crestfall, Maine, 1962
# ============================================================
CASE3 = [
    ('c3-p01', 'c3-p01-the-cliffs-edge',
     'Transform this cliff scene into Dunmore Point, Crestfall Maine, March 1962. Rocky coastline, crashing waves, narrow stone path along cliff edge. A broken wooden safety railing in one section. Morning mist. Shot by Constable Robert Hale on a Brownie box camera, black and white with slight sepia tone. Amateur police documentation, slightly tilted frame. Real 1962 crime scene photo.'),

    ('c3-p02', 'c3-p02-the-lighthouse',
     'Transform this into Dunmore Point Lighthouse at dusk, 1962. White lighthouse with red cap, New England style. Keeper cottage at base with warm light in window. Lighthouse beam cutting through mist. Stone path leading to cliff edge. Shot on Kodak Ektachrome slide film by a Coast Guard photographer during an inspection. Rich saturated 1960s color film look.'),

    ('c3-p03', 'c3-p03-night-in-question',
     'Transform this foggy ocean scene into the view from Dunmore Point Lighthouse on March 8 1962. BUT the sky is clear - stars visible, no fog. The ocean is calm. CLUE: this proves the fog had cleared by 8 PM, contradicting the accidental fall in fog ruling. Shot from the lighthouse gallery looking out to sea. Black and white, taken by Edward Marsh with his personal camera. Real amateur night photograph, slightly underexposed.'),

    ('c3-p04', 'c3-p04-the-headlines',
     'Transform this into the front page of the Crestfall Beacon, March 10 1962. Headline: TRAGEDY AT DUNMORE POINT. Subhead: Keepers Wife Falls From Cliff in Dense Fog. Small town weekly newspaper, simple layout, one photograph of the lighthouse. Printed on cheap newsprint, yellowed and brittle with age. Slightly torn at edges. Real 1962 small-town newspaper. Black and white only.'),

    ('c3-p05', 'c3-p05-the-body',
     'Transform this medical scene into Dr Thomas Greers 1962 examination notes photographed for evidence. Typewritten medical report on institutional paper with handwritten annotations. Key detail circled: bilateral grip bruising on upper arms inconsistent with a fall. A stethoscope and a 1960s medical bag visible at edge of frame. Shot on a copy stand under flat even lighting. Archival document photography.'),

    ('c3-p06', 'c3-p06-catherines-letter',
     'Transform this letter into Catherine Marshs final letter to her friend Maggie Sullivan, dated March 6 1962. Elegant feminine handwriting in dark blue fountain pen on cream stationery. A dried pressed lavender sprig sits on the paper. KEY TEXT visible: I have found something about Helen that changes everything. I need to speak with Edward first. Shot flat on a dark wooden surface with warm side lighting. Real personal correspondence preserved as evidence.'),

    ('c3-p07', 'c3-p07-the-postmistress',
     'Transform this into the Crestfall post office interior, 1962. Small town mail sorting area with wooden cubbyhole mail slots. A ledger book open on the counter. Dorothy Pembrooks reading glasses beside it. Through the window, a view of the small coastal town. Shot on black and white film by a local photographer for a town history book. Warm, intimate, small-town atmosphere. Period 1962 details.'),

    ('c3-p08', 'c3-p08-the-hidden-diary',
     'Transform this diary into Catherine Marshs hidden diary found inside the lighthouse mechanism room. Open leather-bound diary among brass gears and iron machinery. Feminine handwriting in fountain pen. Visible text: She is not who she claims to be. A beam of light falls across the page from the lighthouse lens above. Shot by a forensic photographer with a macro lens. Intimate, secretive, poignant. The voice of a dead woman.'),

    ('c3-p09', 'c3-p09-vera',
     'Transform this institutional building into St Agnes Orphanage in Providence Rhode Island, circa 1950s. Austere brick building, institutional windows, a wooden sign reading ST AGNES HOME FOR CHILDREN. Black and white photograph, slightly faded. Shot on a box camera by a social worker. Real mid-century institutional photography. This is where Vera Novak grew up before she stole Helen Marshs identity.'),

    ('c3-p10', 'c3-p10-dead-womans-name',
     'Transform this legal document into a 1958 Massachusetts death certificate for Helen Ruth Marsh. Official state document with typed entries and official seal. Cause of death: injuries sustained in automobile accident. Filed in Boston. The paper is aged but well-preserved from an archive. Photographed flat on a desk with a magnifying glass over the cause of death line. KEY EVIDENCE: the real Helen Marsh died in 1958.'),

    ('c3-p11', 'c3-p11-the-inheritance',
     'Transform this maritime scene into a photograph of the Marsh family shipping operation, Crestfall Maine, circa 1940s. Old wooden dock with a cargo vessel, crates being loaded. A stern older man in a captains coat supervises - this is Captain Silas Marsh. Black and white, slightly faded. Shot on a Speed Graphic press camera. Old money, old power, old secrets. The shipping fortune that motivated the murder.'),

    ('c3-p12', 'c3-p12-case-closed',
     'Transform this into Catherine Marshs grave at the Crestfall cemetery, photographed in 2004. Simple headstone reading CATHERINE DOYLE MARSH 1933-1962 BELOVED DAUGHTER AND WIFE. Fresh wildflowers placed at the base by her mother Agnes. Shot on a digital camera by a journalist. Overcast sky, autumn leaves on the ground. Quiet, solemn. The end of the story. A woman finally given justice.'),
]

all_images = CASE1 + CASE2 + CASE3
total = len(all_images)
success = 0
fail = 0

for i, (raw, out, prompt) in enumerate(all_images, 1):
    print(f'[{i}/{total}] {out}')
    if transform(raw, out, prompt):
        success += 1
    else:
        fail += 1
    if i < total:
        time.sleep(7)

print(f'\nComplete: {success} success, {fail} failed out of {total}')
