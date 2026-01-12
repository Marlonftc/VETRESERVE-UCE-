
############################################
# Amazon Linux 2023 AMI
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
# Existing Databases VPC (Created by MongoDB QA)
############################################
data "aws_vpc" "databases" {
  id = "vpc-0e3848d22da69d820"
}

############################################
# Existing Private Subnet (AZ us-east-1a)
############################################
data "aws_subnet" "private_a" {
  vpc_id            = data.aws_vpc.databases.id
  availability_zone = "us-east-1a"
}

############################################
# Existing Database Security Group
############################################
data "aws_security_group" "db_sg" {
  name   = "vetreserve-uce-db-qa-databases-db-sg"
  vpc_id = data.aws_vpc.databases.id
}

############################################
# EC2 Instance - Redis QA (Docker)
############################################
resource "aws_instance" "redis" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  subnet_id     = data.aws_subnet.private_a.id

  vpc_security_group_ids = [
    data.aws_security_group.db_sg.id
  ]

  key_name = var.key_name

  user_data = <<EOF
#!/bin/bash
dnf update -y
dnf install -y docker
systemctl start docker
systemctl enable docker

docker run -d \
  --name redis-qa \
  -p 6379:6379 \
  redis:7 redis-server --requirepass ${var.redis_password}
EOF

  tags = {
    Name = "vetreserve-redis-qa"
  }
}
