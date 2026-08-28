# Android release guide

## CI artifacts

The `Android APK` workflow runs for pull requests, pushes to `main`, tags, and manual dispatches.

- Every run produces an installable debug APK for device testing.
- Runs with the four signing secrets produce a signed release APK and release AAB.
- Debug and release application IDs differ: `com.hiroller.debug` and `com.hiroller`.

## Create the Play upload key once

```bash
STOREPASS='choose-a-long-unique-password' KEYPASS='choose-a-long-unique-password' ./scripts/make-keystore.sh
```

Back up `keystore/hiroller.jks` and both passwords somewhere durable. Losing the upload key creates release work; changing the app-signing identity after publication is not an ordinary rebuild.

Add these encrypted GitHub Actions secrets:

- `KEYSTORE_BASE64`: base64 form of `keystore/hiroller.jks`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`: `hiroller`
- `KEY_PASSWORD`

Never commit the JKS file or `keystore.properties`.

## Outputs

```text
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/release/app-release.apk
app/build/outputs/bundle/release/app-release.aab
```

Use the APK for direct installation/testing. Use the signed AAB for Google Play submission.

## Pre-upload checks

1. Install the debug APK on an S24 FE and at least one smaller 360 dp portrait device.
2. Exercise fresh install, update install, offline launch, app background/restore, Android back, audio interruption, and profile reset.
3. Verify the signed APK and AAB use the intended upload certificate.
4. Update version code/name, changelog, screenshots, privacy notice, content rating, and Play data-safety answers.
5. Upload to an internal or closed track before production.
