#!/usr/bin/env bash
# Create a 10-year upload keystore for signed release APKs.
# Do NOT commit the .jks. Put the base64 + passwords in GitHub Secrets:
#   KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p keystore
STOREPASS="${STOREPASS:-hiroller-change-me}"
KEYPASS="${KEYPASS:-$STOREPASS}"
ALIAS="${ALIAS:-hiroller}"
keytool -genkeypair -v \
  -keystore keystore/hiroller.jks \
  -keyalg RSA -keysize 2048 -validity 3650 \
  -alias "$ALIAS" \
  -dname "CN=Hi Roller, OU=artistso, O=artistso, L=Lacey, ST=WA, C=US" \
  -storepass "$STOREPASS" -keypass "$KEYPASS"
cat > keystore.properties <<EOF
storeFile=keystore/hiroller.jks
storePassword=$STOREPASS
keyAlias=$ALIAS
keyPassword=$KEYPASS
EOF
echo "Wrote keystore/hiroller.jks and keystore.properties"
echo "base64 for GitHub secret KEYSTORE_BASE64:"
base64 -w0 keystore/hiroller.jks || base64 keystore/hiroller.jks
echo
