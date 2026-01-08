

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
# Existing Databases VPC
############################################
data "aws_vpc" "databases" {
  filter {
    name   = "tag:Name"
    values = ["vetreserve-uce-databases-vpc"]
  }
}

############################################
# Existing Private Subnets (Databases)
############################################
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.databases.id]
  }

  filter {
    name   = "tag:Name"
    values = [
      "vetreserve-uce-databases-private-1",
      "vetreserve-uce-databases-private-2"
    ]
  }
}

############################################
# Existing Database Security Group (QA)
############################################
data "aws_security_group" "db_sg" {
  filter {
    name   = "tag:Name"
    values = ["vetreserve-uce-db-qa-databases-db-sg"]
  }
}

############################################
# EC2 - SQL Server QA (Docker, Private)
############################################
resource "aws_instance" "sqlserver" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  subnet_id     = data.aws_subnets.private.ids[0]
  key_name      = var.key_name

  vpc_security_group_ids = [
    data.aws_security_group.db_sg.id
  ]

  user_data = <<EOF
#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

docker run -d \
  --name sqlserver-qa \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=${var.sa_password}" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
EOF

  tags = {
    Name = "vetreserve-sqlserver-qa"
  }
}
