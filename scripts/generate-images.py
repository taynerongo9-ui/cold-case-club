"""
Cold Case Club — Batch Image Generation via Gemini (Nano Banana Pro)
Generates crime scene evidence images for all 3 cases + website assets.
"""
import json, base64, os, sys, time, urllib.request, urllib.error

API_KEY = os.environ.get('GEMINI_API_KEY', '')
if not API_KEY:
    print('ERROR: Set GEMINI_API_KEY environment variable')
    sys.exit(1)
MODEL = "nano-banana-pro-preview"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images", "evidence")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# All image prompts — filename: prompt
PROMPTS = {
    # === WEBSITE HERO IMAGES ===
    "unboxing-envelope": "Photorealistic photograph of feminine hands with natural nails opening a thick cream-colored envelope sealed with a dark red wax seal on a kitchen counter. The envelope has embossed gold lettering reading COLD CASE CLUB. Aged paper documents are partially visible emerging from the envelope. Modern well-lit home environment with warm afternoon light from a window, coffee mug nearby. Person wearing a cozy burgundy sweater. Focus on hands and envelope, background naturally blurred with shallow depth of field. Excitement and anticipation mood. Commercial lifestyle photography, warm color grading, 4K resolution.",

    "investigation-board": "Photorealistic photograph of a home office wall with a DIY investigation board. Red string connects photographs, newspaper clippings, handwritten notes, and maps pinned to a corkboard. The board shows a clear investigation in progress with items circled in red marker, question marks written next to suspect photos, a timeline drawn at the bottom. A desk lamp illuminates the board from below. Dark charcoal wall around the corkboard. A glass of red wine and an open manila folder sit on the desk below. Obsessive, focused, atmospheric mood. Think Beautiful Mind meets true crime podcast. Evening lighting, warm tones, cinematic quality, 4K.",

    "gift-box": "Photorealistic photograph of an elegantly presented gift box on a marble surface. The box is matte black with subtle gold foil text and a fingerprint logo embossed on the lid. Box partially open revealing cream tissue paper and the edge of a sealed evidence envelope inside. A gold ribbon untied beside the box. A small card reads Your investigation begins in typewriter font. Soft diffused natural light. Minimal elevated styling, premium unboxing experience. Clean uncluttered background. Commercial product photography, gift-guide quality, 4K resolution.",

    "group-activity": "Warm lifestyle photograph of three women in their 30s-40s sitting around a dining table covered in evidence documents, engaged in animated discussion. Wine glasses on the table, paper documents spread out, a small corkboard propped against the wall behind them. Women are diverse, casually dressed, one pointing at a specific document while another writes notes. Room warmly lit with string lights and candles. Fun, social, engaging mood. Game night meets book club. Lifestyle photography, warm color grading, natural unstaged feeling, 16:9 ratio.",

    # === CASE 1: THE HARGROVE DISAPPEARANCE ===
    "case1-bridge-coat": "Haunting photorealistic photograph of a small-town iron bridge at dawn. A navy peacoat is carefully draped over the iron railing as if deliberately placed. Morning fog lifts off the creek below. The bridge is old iron and wood, rural American style. Bare winter trees line both sides. Cold blue-grey light with faintest warm glow on horizon. The coat is the focal point, a story frozen in a single image. No people visible. Melancholy, eerie, quiet mood. Think Andrew Wyeth meets true crime scene photography. Fine art quality, muted color palette, 4K.",

    "case1-monarch-theatre": "Moody atmospheric photograph of a small-town movie theatre at night, circa 1987. The marquee reads MONARCH THEATRE in warm yellow bulbs. Art deco style building with faded brick. Single streetlight illuminates wet pavement. A woman's silhouette walks away from the entrance in the distance. Light fog drifts through the scene. Dark sky with hint of deep blue. Ominous but beautiful mood. Period-appropriate late 1980s cars parked along the street. Cinematic photography, anamorphic lens feel, warm and cool contrast, 4K.",

    "case1-detective-notes": "Close-up photograph of a handwritten detective notebook page on a worn wooden desk. Blue ballpoint pen on cream ruled paper, slightly messy but legible cursive handwriting. Visible text fragments include Victim last seen 11:42 PM and three witnesses stories dont align and husband check financials. Coffee ring stain overlaps the corner. Edge of a photograph peeks out from under the notebook. Vintage brass pen lies across the page. Warm desk lamp lighting from upper left. Extreme close-up, shallow depth of field. Palpable paper and ink texture. 4K.",

    "case1-stagecoach-bar": "Atmospheric interior photograph of a dimly lit small-town tavern bar, 1987 setting. Dark wood bar counter with brass rail. A single gin and tonic glass sits at the far end near a window. Warm amber lighting from hanging fixtures. Bottles line the back bar. A manila folder sits on the bar counter next to the drink. Empty bar stools suggest late night. No patrons visible. Vintage cash register, neon beer sign in window. Moody, lonely, secretive atmosphere. Period-appropriate decor. Cinematic, noir lighting, 4K.",

    "case1-safe-deposit-box": "Top-down photograph of contents of a safe deposit box spread on dark velvet surface. Items visible: a sealed cream envelope stamped INSURANCE, a small leather-bound diary closed, a brass key on a ring, a folded newspaper clipping yellowed with age, and a piece of paper with handwritten coded text of random-looking letters. Items arranged carefully as if just removed from the box. Dramatic single-source lighting from upper left. Secretive and revealing mood. Macro detail on paper textures and brass patina. Dark noir color palette with warm gold accents, 4K.",

    "case1-parking-lot": "Night photograph of an empty theatre parking lot, 1987. A single silver 1984 Volvo sedan sits alone under a flickering parking lot light. The car doors are unlocked, keys visible in the ignition through the window. Wet asphalt reflects the light. The theatre building is visible in the background, dark, closed for the night. Lonely, unsettling atmosphere. One other car far in the background. Forensic photography feeling, neutral color grading, high detail, 4K.",

    # === CASE 2: THE BELMONT HOTEL FIRE ===
    "case2-belmont-exterior": "Dramatic photograph of a grand Southern hotel at night, circa 1993. Antebellum style with white columns and wrought-iron balconies, classic Charleston architecture. Fourth floor windows glow with eerie orange-amber light suggesting fire. A fire trucks red lights reflect off the wet street. Spanish moss hangs from an oak tree at edge of frame. Rest of hotel is dark. Ominous and stately mood, old money meets disaster. Cinematic lighting, rain-slicked streets, period-appropriate vehicles, 4K.",

    "case2-room-416": "Photograph of a burned hotel room, forensic investigation style. Charred and water-damaged room with blackened walls, melted curtains, destroyed bed frame. Some items survived: a brass room key on nightstand partially melted, a glass tumbler intact with amber liquid residue, a leather briefcase singed but not destroyed on the floor near window. Yellow crime scene tape crosses the doorframe. Forensic marker with number 7 near the briefcase. Harsh portable floodlight creates stark shadows. Clinical and unsettling mood. Forensic photography style, neutral color grading, 4K.",

    "case2-cocktail-napkin": "Close-up photograph of a cocktail napkin from a yacht club with an embossed anchor logo, sitting on a dark polished bar surface. Hastily written note in blue pen reads: Left through kitchen 9:45. Back 10:30. Smelled like smoke. The napkin is slightly crumpled. A glass of bourbon with two ice cubes sits beside it. A brass cufflink nearby. Warm bar lighting, low amber intimate. Conspiratorial mood, someone noticed something they were not supposed to. Shallow depth of field focused on handwriting, square format, 4K.",

    "case2-security-camera": "Grainy security camera still image of a hotel hallway at night. Timestamp reads 10-17-93 21:38:47 in the corner. The hallway is dimly lit with period-appropriate carpet and wall sconces. A tall figure in a dark tuxedo is seen from behind walking quickly toward a stairwell door. The image is slightly blurry and has scan lines typical of 1993 CCTV footage. Black and white with slight green tint. Surveillance footage aesthetic, low resolution feel but printable quality, 4K.",

    # === CASE 3: THE LIGHTHOUSE KEEPER'S WIFE ===
    "case3-lighthouse": "Dramatic photograph of a lighthouse on a rocky cliff overlooking the ocean, coastal Maine setting, circa 1962. White lighthouse with red cap, classic New England design. Dusk lighting, lighthouse beam visible cutting through light mist. Small keepers cottage at the base with warm light glowing from one window. Dramatic cliff edge with jagged rocks and crashing waves below. Narrow stone path from cottage to cliff edge disappearing into shadow. Deep purple-grey sky with storm clouds breaking apart. Isolated, romantic, dangerous mood. Landscape photography, golden hour to blue hour transition, cinematic composition, 4K.",

    "case3-cliff-path": "Dramatic photograph of a narrow stone cliff path at dawn, coastal Maine. The path winds along a cliff edge with a wooden railing that is broken and missing in one section. Wildflowers grow between stones. A single womans leather glove lies on the path near the broken railing. Morning mist lifts from the ocean below, jagged rocks and white foam visible at the cliff base. Sky transitions from deep purple to soft gold at horizon. Beautiful, dangerous, mournful mood. Something terrible happened here. Fine art photography, muted palette with one warm accent, 4K.",

    "case3-diary": "Intimate close-up of an open leather-bound diary sitting inside a lighthouse mechanism space surrounded by brass gears and iron machinery. Diary pages are cream-colored with elegant feminine handwriting in dark blue fountain pen ink. Visible text fragments include March 6 and She is not who she claims to be and I must tell Edward. A small dried pressed lavender sprig between the pages. Diary illuminated by a single beam of light from above like a lighthouse lens. Brass machinery creates beautiful bokeh in background. Secret, intimate, poignant mood. A womans voice preserved in hiding. Macro photography, warm light, 4K.",

    "case3-cottage-interior": "Interior photograph of a lighthouse keepers cottage, 1962 coastal Maine. Simple, sparse living room with a stone fireplace, worn wooden floor, braided rug. A rocking chair near the window with a knitted blanket draped over it. Oil lamp on a small table next to a stack of books. Through the window, the lighthouse beam sweeps past. Nautical touches: a ships clock on the mantel, a framed maritime chart. Warm but lonely atmosphere. Period-appropriate decor, no modern items. Intimate, isolated mood. Warm interior lighting contrasting with cold blue exterior through window, 4K.",

    "case3-orphanage-letter": "Close-up photograph of an aged institutional letter on a dark surface. The letterhead reads ST. AGNES ORPHANAGE, PROVIDENCE, RHODE ISLAND in formal serif type. The letter is dated 1959 and addressed to Vera Novak. The paper is cream-colored with slight foxing and age spots. An institutional seal or stamp is partially visible. The letter sits next to a black-and-white photograph of a young woman (shown from behind, face not visible) standing in front of a brick building. A brass paper clip holds them together. Dramatic side lighting. Documentary, archival feeling. Dark noir palette, 4K.",
}

def generate_image(filename, prompt):
    """Generate a single image via Gemini API"""
    if os.path.exists(os.path.join(OUTPUT_DIR, f"{filename}.jpg")):
        print(f"  SKIP {filename}.jpg (already exists)")
        return True

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    }).encode('utf-8')

    req = urllib.request.Request(API_URL, data=payload, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  FAIL {filename}: HTTP {e.code} — {error_body[:200]}")
        return False
    except Exception as e:
        print(f"  FAIL {filename}: {e}")
        return False

    if 'error' in data:
        print(f"  FAIL {filename}: {data['error'].get('message', 'Unknown error')[:200]}")
        return False

    parts = data.get('candidates', [{}])[0].get('content', {}).get('parts', [])
    for p in parts:
        if 'inlineData' in p:
            img_data = base64.b64decode(p['inlineData']['data'])
            mime = p['inlineData'].get('mimeType', 'image/jpeg')
            ext = 'png' if 'png' in mime else 'jpg'
            filepath = os.path.join(OUTPUT_DIR, f"{filename}.{ext}")
            with open(filepath, 'wb') as f:
                f.write(img_data)
            print(f"  DONE {filename}.{ext} ({len(img_data):,} bytes)")
            return True

    print(f"  FAIL {filename}: No image in response")
    return False

if __name__ == "__main__":
    print(f"Generating {len(PROMPTS)} images via {MODEL}...")
    print(f"Output: {OUTPUT_DIR}\n")

    success = 0
    failed = 0

    for i, (filename, prompt) in enumerate(PROMPTS.items(), 1):
        print(f"[{i}/{len(PROMPTS)}] {filename}")
        if generate_image(filename, prompt):
            success += 1
        else:
            failed += 1

        # Rate limit: ~10 requests per minute for free tier
        if i < len(PROMPTS):
            time.sleep(8)

    print(f"\nDone: {success} succeeded, {failed} failed")
    print(f"Images saved to: {OUTPUT_DIR}")
