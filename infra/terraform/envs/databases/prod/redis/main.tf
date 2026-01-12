provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "databases-prod"
      Service     = "redis"
      ManagedBy   = "Terraform"
    }
  }
}

# Shared VPC for database account
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
    "us-east-2a",
    "us-east-2b"
  ]
}

# Security group for Redis
module "security" {
  source = "../../../../modules/security"

  project_name      = "${var.project_name}-db-prod"
  environment       = "databases"
  vpc_id            = module.network.vpc_id
  allowed_http_cidr = []
}

# EC2 instance running Redis in Docker
resource "aws_instance" "redis" {
  ami                    = "ami-0b9064170e32bde34" # Amazon Linux 2 (Ohio)
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
  --name redis-prod \
  -p 6379:6379 \
  redis:7 redis-server --requirepass ${var.redis_password}
EOF

  tags = {
    Name = "vetreserve-redis-prod"
  }
}
