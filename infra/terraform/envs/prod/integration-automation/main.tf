terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "PROD"
      Domain      = "integration-automation"
      ManagedBy   = "Terraform"
    }
  }
}

module "network" {
  source = "../../../modules/network"

  project_name = "vetreserve-uce"
  environment  = var.environment

  vpc_cidr = "10.10.0.0/16"

  public_subnets = [
    "10.10.1.0/24",
    "10.10.2.0/24"
  ]

  private_subnets = [
    "10.10.101.0/24",
    "10.10.102.0/24"
  ]

  availability_zones = [
    "us-east-2a",
    "us-east-2b"
  ]
}

module "security" {
  source = "../../../modules/security"

  project_name      = "vetreserve-uce"
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  allowed_http_cidr = ["0.0.0.0/0"]
}

module "ec2" {
  source = "../../../modules/ec2_docker"

  project_name      = "vetreserve-uce"
  environment       = var.environment
  instance_type     = "t3.micro"
  ami_id            = "ami-0abcdef1234567890" # Amazon Linux 2
  subnet_ids        = module.network.private_subnet_ids
  security_group_id = module.security.app_sg_id
  key_name          = "vetreserve-key"
}

module "alb" {
  source = "../../../modules/alb"

  project_name          = "vetreserve-uce"
  environment           = var.environment
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  alb_security_group_id = module.security.alb_sg_id
  target_port           = 8084
}

module "asg" {
  source = "../../../modules/asg"

  project_name        = "vetreserve-uce"
  environment         = var.environment
  subnet_ids          = module.network.private_subnet_ids
  launch_template_id  = module.ec2.launch_template_id
  target_group_arn    = module.alb.target_group_arn

  min_size         = 2
  max_size         = 4
  desired_capacity = 2
}

