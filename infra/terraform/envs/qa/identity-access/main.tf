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
# AMI - Amazon Linux 2023
############################################
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

############################################
# Network
############################################
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
    "us-east-1a",
    "us-east-1b"
  ]
}

############################################
# Security (SSH enabled in QA)
############################################
module "security" {
  source = "../../../modules/security"

  project_name      = "vetreserve-uce"
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  allowed_http_cidr = ["0.0.0.0/0"]

  ssh_allowed_cidr  = var.ssh_allowed_cidr
}

############################################
# EC2 - Public (SSH access)
############################################
module "ec2" {
  source = "../../../modules/ec2_docker"

  project_name      = "vetreserve-uce"
  environment       = var.environment
  instance_type     = "t3.micro"

  ami_id            = data.aws_ami.amazon_linux_2023.id

  subnet_ids        = module.network.public_subnet_ids
  security_group_id = module.security.app_sg_id

  key_name          = "vetreserve-key"
}

############################################
# ALB
############################################
module "alb" {
  source = "../../../modules/alb"

  project_name          = "vetreserve-uce"
  environment           = var.environment
  domain                = "identity-access"
  domain_short          = "iam"
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  alb_security_group_id = module.security.alb_sg_id
  target_port           = 8080
}
