terraform {
  backend "s3" {
    bucket  = "vetreserve-uce-terraform-state-qa"
    key     = "root/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

