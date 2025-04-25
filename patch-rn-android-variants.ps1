<#
.SYNOPSIS
  Idempotently patch all node_modules/*/android/build.gradle to publish only release & debug AARs under AGP 8.x.

.DESCRIPTION
  - Finds every android/build.gradle under node_modules.
  - Strips a leading UTF‑8 BOM.
  - Removes any existing 'publishing { … }' block.
  - Backs up each to build.gradle.bak.
  - Injects a publishing { singleVariant("release"); singleVariant("debug") } snippet under the first 'android {'.
#>

Param(
  [string]$Root = ".\node_modules"
)

if (-not (Test-Path $Root)) {
  Write-Error "Path '$Root' not found. Run from your project root or pass -Root."
  exit 1
}

Get-ChildItem -Path $Root -Filter build.gradle -Recurse |
  Where-Object { $_.FullName -match "[\/\\]android[\/\\]" } |
  ForEach-Object {
    $file = $_.FullName
    Write-Host "`n--> Processing: $file"

    # Read raw text, strip BOM if present
    $raw = Get-Content -Path $file -Raw -Encoding UTF8
    $raw = $raw -replace '^\uFEFF', ''

    # Remove any existing publishing { ... } block (multi-line)
    $pattern = '(?ms)^[ \t]*publishing\s*\{.*?^\s*\}\s*'
    $clean  = [regex]::Replace($raw, $pattern, '')

    # Split into lines
    $lines = $clean -split "`r?`n"

    # Locate the first 'android {' line with a for‑loop
    $androidIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match '^\s*android\s*\{') {
        $androidIdx = $i
        break
      }
    }
    if ($androidIdx -eq -1) {
      Write-Host "    • No 'android {' block found; skipping."
      return
    }

    # Backup original
    $bak = "$file.bak"
    Copy-Item -Path $file -Destination $bak -Force
    Write-Host "    • Backed up to: $bak"

    # Determine indentation
    if ($lines[$androidIdx] -match '^(\s*)android') {
      $indent = $matches[1]
    } else {
      $indent = ""
    }

    # Build the singleVariant publishing snippet
    $snippet = @(
      $indent + "    publishing {"
      $indent + "        singleVariant(`"release`")"
      $indent + "    }"
    )

    # Inject snippet under android {
    $before  = $lines[0..$androidIdx]
    $after   = if ($androidIdx + 1 -lt $lines.Count) { $lines[($androidIdx+1)..($lines.Count-1)] } else { @() }
    $patched = $before + $snippet + $after

    # Write back as UTF-8 no BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($file, $patched, $utf8NoBom)

    Write-Host "    ✅ Patched successfully!"
  }

Write-Host "`n🎉 All done. Now rebuild your Android app:`n   cd android; .\gradlew clean; cd ..; npx react-native run-android"
