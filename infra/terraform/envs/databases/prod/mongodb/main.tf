############################################
# AWS Provider
############################################
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "databases-prod"
      Service     = "mongodb"
      ManagedBy   = "Terraform"
    }
  }
}

############################################
# AMI Amazon Linux 2 (DINÁMICO – Virginia)
############################################
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

############################################
# Shared VPC for database account
############################################
module "network" {
  source = "../../../../modules/network"

  project_name = var.project_name
  environment  = "databases"

  vpc_cidr = "10.30.0.0/16"

  public_subnets = []

  private_subnets = [
    "10.30.101.0/24",
    "10.30.102.0/24"
  ]

  availability_zones = [
    "us-east-1a",
    "us-east-1b"
  ]
}

############################################
# Security group for MongoDB
############################################
module "security" {
  source = "../../../../modules/security"

  project_name      = "${var.project_name}-db-prod"
  environment       = "databases"
  vpc_id            = module.network.vpc_id
  allowed_http_cidr = []
}

############################################
# EC2 instance running MongoDB in Docker
############################################
resource "aws_instance" "mongodb" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = module.network.private_subnet_ids[0]
  vpc_security_group_ids = [module.security.db_sg_id]
  key_name               = var.key_name

  user_data = <<EOF
#!/bin/bash
yum update -y
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker

docker run -d \
  --name mongodb-prod \
  -e MONGO_INITDB_ROOT_USERNAME=${var.mongo_root_user} \
  -e MONGO_INITDB_ROOT_PASSWORD=${var.mongo_root_password} \
  -p 27017:27017 \
  mongo:6
EOF

  tags = {
    Name = "vetreserve-mongodb-prod"
  }
}
