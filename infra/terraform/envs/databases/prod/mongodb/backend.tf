terraform {
  backend "s3" {
    bucket         = "vetreserve-uce-terraform-state"
    key            = "databases/prod/mongodb/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}
