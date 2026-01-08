############################################
# Terraform Settings
############################################
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


############################################
# QA ACCOUNT 1 – Core Client Domains
############################################
module "qa_client_pet_management" {
  source = "../envs/qa/client-pet-management"

  providers = {
    aws = aws.qa_1
  }
}

module "qa_clinical_information" {
  source = "../envs/qa/clinical-information"

  providers = {
    aws = aws.qa_1
  }
}

############################################
# QA ACCOUNT 2 – Communication & Identity
############################################
module "qa_communication_insights" {
  source = "../envs/qa/communication-insights"

  providers = {
    aws = aws.qa_2
  }
}

module "qa_identity_access" {
  source = "../envs/qa/identity-access"

  providers = {
    aws = aws.qa_2
  }
}

############################################
# QA ACCOUNT 3 – Automation & Scheduling
############################################
module "qa_integration_automation" {
  source = "../envs/qa/integration-automation"

  providers = {
    aws = aws.qa_3
  }
}

module "qa_scheduling_appointments" {
  source = "../envs/qa/scheduling-appointments"

  providers = {
    aws = aws.qa_3
  }
}

############################################
# DATABASES – SEPARATE AWS ACCOUNT
############################################
module "qa_databases" {
  source = "../envs/databases/qa"

  providers = {
    aws = aws.databases
  }
}
