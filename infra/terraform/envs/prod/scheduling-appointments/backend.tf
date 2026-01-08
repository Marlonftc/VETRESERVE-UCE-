terraform {
  backend "s3" {
    bucket         = "vetreserve-uce-terraform-state"
    key            = "prod/scheduling-appointments/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
