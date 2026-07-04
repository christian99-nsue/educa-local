Set-Location "$PSScriptRoot\Frontend"
npm run build
Set-Location $PSScriptRoot
git add Frontend/dist -f
git commit -m "Actualizacion de la pagina"
$hash = git subtree split --prefix Frontend/dist HEAD
git push origin "${hash}:gh-pages" --force
Write-Host "Despliegue completado!" -ForegroundColor Green