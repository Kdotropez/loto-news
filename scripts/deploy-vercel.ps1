param(
  [string]$Token = $env:VERCEL_TOKEN
)

if (-not $Token) {
  Write-Error "VERCEL_TOKEN manquant. Définissez VERCEL_TOKEN (ou passez -Token)."
  exit 1
}

Write-Host "🔗 Liaison du projet à Vercel..." -ForegroundColor Cyan
npx vercel link --yes --project loto-analyzer --token $Token
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🚀 Déploiement en production..." -ForegroundColor Green
npx vercel --prod --yes --token $Token
exit $LASTEXITCODE




