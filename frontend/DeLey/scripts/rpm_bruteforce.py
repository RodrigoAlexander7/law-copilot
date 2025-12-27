import random
import time
import requests

BASE_URL = "https://models.readyplayer.me/"
QUERY = "?morphTargets=ARKit,Oculus Visemes&textureSizeLimit=1024&textureFormat=png"
OUTPUT_FILE = "valid_ids.txt"

TOTAL_TRIES = 10000
DELAY = 0.25
READ_BYTES = 2048

# Prefijos REALES (timestamps hex)
PREFIXES = [
    "64bfa15f",
    "65a8dba8"
]

tested_ids = set()

def random_hex(n):
    return "".join(random.choice("abcdef0123456789") for _ in range(n))

print("🚀 Starting GUIDED RANDOM RPM scan...\n")

for i in range(1, TOTAL_TRIES + 1):

    prefix = random.choice(PREFIXES)

    # completar hasta 24 chars
    avatar_id = prefix + random_hex(24 - len(prefix))

    if avatar_id in tested_ids:
        continue

    tested_ids.add(avatar_id)

    url = f"{BASE_URL}{avatar_id}.glb{QUERY}"

    try:
        r = requests.get(
            url,
            stream=True,
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0"}
        )

        status = r.status_code

        if status == 200:
            chunk = next(r.iter_content(chunk_size=READ_BYTES), b"")
            if len(chunk) > 500:
                print(f"[{i:05}] ✅ FOUND {avatar_id}")
                with open(OUTPUT_FILE, "a") as f:
                    f.write(avatar_id + "\n")
            else:
                print(f"[{i:05}] ⚠️ SMALL {avatar_id}")
        else:
            print(f"[{i:05}] {status} {avatar_id}")

    except Exception as e:
        print(f"[{i:05}] ERROR {avatar_id}")

    time.sleep(DELAY)

print("\n🏁 Done. Check valid_ids.txt")
