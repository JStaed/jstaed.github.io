#!/usr/bin/env python3
"""Refresh the PennWest Edinboro dining menu data used by the meal planner.

Run from anywhere:
    python update_menu.py            # fetch + rewrite data.js
    python update_menu.py --push     # ...then git add / commit / push data.js

Options:
    --start YYYY-MM-DD   first Sunday to fetch (default: Sunday of this week)
    --weeks N            number of weeks to fetch (default 8; empty weeks are fine)
    --out PATH           where to write data.js (default: next to this script)

Needs only Python 3.8+ and an internet connection (no extra packages).
Writes data.js next to this script. Nothing is overwritten if the fetch
returns no menu items, so a failed run leaves the site as it was.
"""
import argparse, concurrent.futures as cf, datetime, json, os, re, subprocess, sys, urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data.js")
LOCATION_ID = 195                        # PennWest Edinboro on AVI Dish
MEALS = {501: "B", 502: "L", 503: "D"}   # breakfast, lunch, dinner

# ---------------------------------------------------------------- portion rules
# Turns the dining hall's ounce serving sizes into things you can eyeball.
# First matching rule wins. Format: "c:<oz per cup>", "w:<singular>|<plural>" (whole item),
# "n:<singular>|<plural>:<oz each>" (counted pieces), "t:<oz per tbsp>", "p" (palm of meat).
R=[]
def r(p,v): R.append((re.compile(p,re.I),v))
# order matters: first match wins
r(r"^biscuit","w:biscuit with gravy|biscuits with gravy")
r(r"made to order","c:8")
r(r"^(?!.*\b(with|and)\b)(?!.*rollatini).*(gravy|sauce|crema|salsa|aioli|dressing|marinade|glaze|guacamole|ranch|butter)$","t:0.56")
r(r"^(fresh )?salsa|salsa$","t:0.56")
r(r"beef chili|chili verde|\bsoup\b|chowder|gumbo|stew|jambalaya|goulash|bisque","c:8.5")
r(r"\bcod\b|tilapia|whitefish|salmon|\bfish\b(?! (tacos|sandwich))","p")
r(r"grilled portabella","w:mushroom cap|mushroom caps")
r(r"flatbread","w:flatbread|flatbreads")
r(r"calzone","w:calzone|calzones")
r(r"pizza","w:slice|slices")
r(r"\bwrap\b","w:wrap|wraps")
r(r"quesadilla","w:quesadilla|quesadillas")
r(r"breakfast taco","w:taco|tacos")
r(r"taco bar|taco meat|\bbowl\b|bibimbap","c:8")
r(r"\btacos?\b","n:taco|tacos:3.0")
r(r"meatloaf","n:slice|slices:4.0")
r(r"burger","w:burger|burgers")
r(r"hot dog","w:hot dog|hot dogs")
r(r"sandwich|panini|\bsub\b|melt|reuben|cheesesteak|\bblt\b|grilled cheese|ciabatta","w:sandwich|sandwiches")
r(r"egg roll","w:egg roll|egg rolls")
r(r"chimichanga","w:chimichanga|chimichangas")
r(r"stuffed pepper","w:stuffed pepper|stuffed peppers")
r(r"stuffed portabella","n:mushroom cap|mushroom caps:3.5")
r(r"pot pie","w:pot pie|pot pies")
r(r"enchilada","n:enchilada|enchiladas:4.2")
r(r"pierogi","n:pierogi|pierogi:1.9")
r(r"french toast sticks","n:stick|sticks:1.2")
r(r"french toast casserole","c:6")
r(r"french toast","n:slice|slices:2.4")
r(r"pancake","n:pancake|pancakes:2.4")
r(r"muffin","w:muffin|muffins")
r(r"pretzel","w:pretzel|pretzels")
r(r"bread stick","w:breadstick|breadsticks")
r(r"garlic bread","w:slice|slices")
r(r"frittata|quiche","w:wedge|wedges")
r(r"lasagna","w:square|squares")
r(r"meatball","n:meatball|meatballs:2.0")
r(r"sausage link","w:link|links")
r(r"sausage patty|hashbrown patty|hash brown patty","w:patty|patties")
r(r"^bacon$","n:slice|slices:0.27")
r(r"^grilled (bratwurst|kielbasa|italian sausage)","w:sausage|sausages")
r(r"onion rings","n:ring|rings:0.55")
r(r"hush puppies","n:hush puppy|hush puppies:0.9")
r(r"tater tots","n:tot|tots:0.45")
r(r"chips","n:handful|handfuls:1.0")
r(r"french fries|\bfries\b","c:3.7")
r(r"wedges","c:4.5")
r(r"plantains","n:slice|slices:0.5")
r(r"corn on the cob","n:ear of corn|ears of corn:5.0")
r(r"chicken quarters","w:chicken quarter|chicken quarters")
r(r"pork chops","w:pork chop|pork chops")
r(r"cutlet|parmesan$|francaise","w:cutlet|cutlets")
r(r"salisbury steak|smothered steak","w:steak with gravy|steaks with gravy")
r(r"beef chili|chili verde|\bsoup\b|chowder|gumbo|stew|jambalaya|goulash|bisque","c:8.5")
r(r"scrambled eggs","c:7.5")
r(r"caesar|harvest salad|kale salad","c:3.2")
r(r"chicken salad|tuna salad|egg salad","c:6.5")
r(r"salad|slaw","c:5.0")
r(r"cauliflower (fried )?rice","c:4.5")
r(r"breast|\bthighs?\b|\bloin\b|roast beef|\bham\b","p")
r(r"stir fry|curry|masala|tikka|korma|casserole|\bbake\b|primavera|ragu|bolognese|cacciatore|sofrito|poblano|tinga|fajita|stroganoff|pot roast|braised (beef|chicken)|lentil|tarka|kung pao|teriyaki|lo mein|pelau|hash$|firehouse|burrito|pulled|scampi|tofu with|stuffed pepper|buffalo chicken pasta","c:8")
r(r"pasta|penne|ziti|macaroni|tortellini|ravioli|gnocchi|bowtie|noodle","c:6.5")
r(r"grits|oatmeal|overnight oats|polenta","c:8.4")
r(r"rice|pilaf|quinoa|couscous|orzo|barley|risotto|farro|biryani","c:5.6")
r(r"mashed|whipped|smashed","c:7.5")
r(r"scalloped|cheesy potatoes|stuffing","c:6")
r(r"kale|spinach|chard|collard|greens","c:6")
r(r"beans|chickpea|dal\b","c:6.3")
r(r"potato|hash brown|home fry|o'brien|plantain","c:5.3")
r(r"carrot|broccoli|cauliflower|squash|zucchini|corn|peas|cabbage|brussels|okra|eggplant|mushroom|vegetable|medley|peppers|bok choy|sauerkraut|asparagus|tomato|onion|caponata|nimono|cucumber|pepper","c:5.0")
r(r"chicken|turkey|pork|beef|\bham\b|steak|loin|roast|fish|cod\b|tilapia|whitefish|tempeh|tofu|seitan|brisket|lamb|shrimp|salmon|carnitas|birria|bacon|ham\b|sausage","p")
def vis(name,oz):
    n=re.sub(r"\s*\(.*?\)\s*","",name.strip())
    for rx,v in R:
        if rx.search(n): return v,True
    return ("c:8" if oz>=6 else "c:5.5"),False

# ---------------------------------------------------------------- fetch
def fetch(job):
    d, m = job
    url = ("https://dish.avifoodsystems.com/api/menu-items/week?date=%d/%d/%d&locationId=%d&mealId=%d"
           % (d.month, d.day, d.year, LOCATION_ID, m))
    err = None
    for _ in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (menu-sync)"})
            return d, m, json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as e:
            err = e
    print("  failed:", d, m, err)
    return d, m, []

def num(x):
    try:
        return round(float(x), 2)
    except (TypeError, ValueError):
        return 0

STN = {"HOMESTEAD": "Homestead", "ROOTS": "Roots", "CLARITY": "Clarity", "FUSION": "Fusion",
       "SMOKE N FIRE": "Smoke N Fire", "TRATTORIA PIZZA": "Trattoria Pizza",
       "TRATTORIA PASTA": "Trattoria Pasta", "CARVERY": "Carvery", "NUTRIBAR": "Nutribar", "SOUPS": "Soups"}

def build(raw):
    items, menu = {}, {}
    for _, m, j in raw:
        for i in j:
            items.setdefault(i["id"], i)
            menu.setdefault(i["date"][:10], {"B": set(), "L": set(), "D": set()})[MEALS[m]].add(i["id"])
    stations = list(STN.values())
    for i in items.values():
        if i["stationName"] not in STN:   # a new station appeared: add it rather than crash
            STN[i["stationName"]] = i["stationName"].title()
            stations.append(STN[i["stationName"]])
    A = sorted({a["name"] for i in items.values() for a in i["allergens"]})
    P = sorted({a["name"] for i in items.values() for a in i["preferences"]})
    rows, unmatched = [], []
    for i in sorted(items.values(), key=lambda i: i["name"].lower()):
        n = i["nutritionals"]; oz = num(n["servingSize"])
        am = sum(1 << A.index(a["name"]) for a in i["allergens"])
        pm = sum(1 << P.index(a["name"]) for a in i["preferences"])
        v, matched = vis(i["name"], oz)
        if not matched: unmatched.append(i["name"])
        rows.append([i["id"], re.sub(r"\s+", " ", i["name"]).strip(), stations.index(STN[i["stationName"]]), oz,
                     num(n["calories"]), num(n["fat"]), num(n["saturatedFat"]), num(n["transFat"]),
                     num(n["cholesterol"]), num(n["sodium"]), num(n["carbohydrates"]), num(n["dietaryFiber"]),
                     num(n["sugars"]), num(n["addedSugar"]), num(n["protein"]), am, pm, v,
                     (i.get("description") or "").strip()])
    M = {d: {k: sorted(v) for k, v in s.items()} for d, s in sorted(menu.items())}
    return {"S": stations, "A": A, "P": P, "I": rows, "M": M, "asof": str(datetime.date.today())}, unmatched

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--start"); ap.add_argument("--weeks", type=int, default=8); ap.add_argument("--out", default=OUT)
    ap.add_argument("--push", action="store_true", help="git add, commit and push data.js afterwards")
    a = ap.parse_args()
    today = datetime.date.today()
    start = datetime.date.fromisoformat(a.start) if a.start else today - datetime.timedelta(days=(today.weekday() + 1) % 7)
    jobs = [(start + datetime.timedelta(weeks=w), m) for w in range(a.weeks) for m in MEALS]
    print("Fetching %d weeks starting %s ..." % (a.weeks, start))
    with cf.ThreadPoolExecutor(6) as ex:
        raw = [(str(d), m, j) for d, m, j in ex.map(fetch, jobs)]
    D, unmatched = build(raw)
    if not D["I"] or not D["M"]:
        sys.exit("No menu items came back (site down or no menus posted). data.js was NOT changed.")
    days = sorted(D["M"])
    print("Got %d items across %d days (%s to %s)." % (len(D["I"]), len(days), days[0], days[-1]))
    if unmatched:
        print("%d items used the default portion size (add a rule above if any look wrong):" % len(unmatched))
        for n in unmatched[:15]: print("   -", n)
    js = ("/* Generated by update_menu.py from the PennWest Edinboro dining hall menu. Do not edit by hand. */\n"
          "window.MENU_DATA = " + json.dumps(D, separators=(",", ":"), ensure_ascii=False) + ";\n")
    with open(a.out, "w", encoding="utf-8", newline="\n") as f: f.write(js)
    print("Wrote", a.out)
    if a.push:
        out_dir = os.path.dirname(os.path.abspath(a.out)); name = os.path.basename(a.out)
        run = lambda *c: subprocess.run(c, cwd=out_dir, check=True)
        run("git", "add", name)
        if subprocess.run(["git", "diff", "--cached", "--quiet", "--", name], cwd=out_dir).returncode == 0:
            print("Menu data is unchanged; nothing to push."); return
        run("git", "commit", "-m", "Update PennWest menu data (%s)" % D["asof"])
        run("git", "push")
        print("Pushed.")
    else:
        print("Review the page locally, then re-run with --push (or commit data.js yourself).")

if __name__ == "__main__":
    main()
