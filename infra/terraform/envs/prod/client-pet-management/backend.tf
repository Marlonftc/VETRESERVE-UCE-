terraform {
  backend "s3" {
    bucket         = "vetreserve-uce-terraform-state"
    key = "prod/client-pet-management/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
