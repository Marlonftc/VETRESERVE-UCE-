
############################################
# Data source: Amazon Linux 2023 AMI
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
# Network (Private VPC for Databases)
############################################
module "network" {
  source = "../../../../modules/network"

  project_name = var.project_name
  environment  = var.environment

  vpc_cidr = "10.30.0.0/16"

  # Databases do not need public subnets
  public_subnets = []

  private_subnets = [
    "10.30.101.0/24",
    "10.30.102.0/24"
  ]

  availability_zones = [
    "${var.aws_region}a",
    "${var.aws_region}b"
  ]
}

############################################
# Security Group for MongoDB
############################################
module "security" {
  source = "../../../../modules/security"

  project_name      = "${var.project_name}-db"
  environment       = var.environment
  vpc_id            = module.network.vpc_id

  # MongoDB does not expose HTTP
  allowed_http_cidr = []
}

############################################
# EC2 Instance running MongoDB (Docker)
############################################
resource "aws_instance" "mongodb" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = module.network.private_subnet_ids[0]
  vpc_security_group_ids = [module.security.db_sg_id]
  key_name               = var.key_name

  user_data = <<EOF
#!/bin/bash
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# Run MongoDB container
docker run -d \
  --name mongodb-qa \
  -e MONGO_INITDB_ROOT_USERNAME=${var.mongo_root_user} \
  -e MONGO_INITDB_ROOT_PASSWORD=${var.mongo_root_password} \
  -p 27017:27017 \
  mongo:6
EOF

  tags = {
    Name = "vetreserve-mongodb-qa"
  }
}
