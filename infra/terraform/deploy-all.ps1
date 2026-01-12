Write-Host "========================================"
Write-Host " VETRESERVE-UCE - FULL QA DEPLOY"
Write-Host "========================================"

Set-Location ./root

terraform init -reconfigure
terraform apply -auto-approve

Write-Host "========================================"
Write-Host " QA DEPLOY FINISHED SUCCESSFULLY"
Write-Host "========================================"
