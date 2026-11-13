#!/usr/bin/env bash
# compila Andén para el Apple Watch, lo firma con tu equipo y lo instala en tu reloj real.
# con una cuenta gratuita el perfil dura 7 días: volvé a correr este script para renovarlo.
#
#   TEAM_ID=XXXXXXXXXX ./scripts/install-watch.sh
#   ./scripts/install-watch.sh --dry-run        solo muestra qué reloj encontró
#
# nunca usa simuladores de watchOS: compila solo para el reloj emparejado.
set -euo pipefail
cd "$(dirname "$0")/.."

DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
tmp=$(mktemp); trap 'rm -f "$tmp"' EXIT
xcrun devicectl list devices --json-output "$tmp" >/dev/null 2>&1
read -r ID UDID WNAME < <(python3 - "$tmp" <<'PY'
import json, sys
for d in json.load(open(sys.argv[1]))["result"]["devices"]:
    hw, dp = d.get("hardwareProperties", {}), d.get("deviceProperties", {})
    if hw.get("deviceType") == "appleWatch":
        print(d["identifier"], hw.get("udid", ""), dp.get("name", "").replace(" ", "_")); break
PY
) || true
[ -n "${ID:-}" ] || { echo "no encontré un Apple Watch emparejado (desbloquealo y acercá el iPhone)" >&2; exit 1; }
echo "reloj: ${WNAME//_/ } ($UDID)"
[ "$DRY" = 1 ] && exit 0

: "${TEAM_ID:?definí TEAM_ID con tu team id de Apple}"
command -v xcodegen >/dev/null || { echo "falta xcodegen: brew install xcodegen" >&2; exit 1; }

# la dirección y la clave pública del servidor salen del .env de la app, sin copiarlas al repositorio
ENV_APP="../movil/.env"
[ -f "$ENV_APP" ] || { echo "no encuentro apps/movil/.env" >&2; exit 1; }
URL=$(grep '^EXPO_PUBLIC_SUPABASE_URL=' "$ENV_APP" | cut -d= -f2-)
CLAVE=$(grep '^EXPO_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_APP" | cut -d= -f2-)
HOST=${URL#https://}; HOST=${HOST%/}
printf 'ANDEN_SUPABASE_HOST = %s\nANDEN_SUPABASE_CLAVE = %s\n' "$HOST" "$CLAVE" > Config/Secrets.xcconfig

xcodegen generate >/dev/null
xcodebuild -project AndenReloj.xcodeproj -scheme AndenReloj -configuration Release \
  -destination "platform=watchOS,id=$UDID" -allowProvisioningUpdates DEVELOPMENT_TEAM="$TEAM_ID" \
  -derivedDataPath build build | grep -E 'error:|BUILD' || true

APP=$(find build -path '*Release-watchos/AndenReloj.app' -maxdepth 6 2>/dev/null | head -1)
[ -d "${APP:-}" ] || { echo "no encontré AndenReloj.app compilado" >&2; exit 1; }
xcrun devicectl device install app --device "$ID" "$APP"
xcrun devicectl device process launch --device "$ID" com.kisnner.anden.reloj
