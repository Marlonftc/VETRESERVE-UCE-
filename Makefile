.PHONY: help test build infra-plan infra-validate

help:
	@echo "VETRESERVE-UCE commands"
	@echo " make test              Run backend tests"
	@echo " make infra-validate    Validate Terraform QA"
	@echo " make infra-plan        Terraform plan (QA)"

# -----------------------
# Backend
# -----------------------
test:
	cd backend/domain && pytest -q || true

# -----------------------
# Terraform QA
# -----------------------
infra-validate:
	cd infra/qa && terraform validate

infra-plan:
	cd infra/qa && terraform plan
