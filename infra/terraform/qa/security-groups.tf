########################################
# Bastion Security Group
########################################
resource "aws_security_group" "bastion_sg" {
  name   = "${var.project_name}-bastion-sg"
  vpc_id = aws_vpc.qa_vpc.id

  ingress {
    description = "SSH access from admin network"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-bastion-sg"
    Env  = "qa"
    Role = "bastion"
  }
}

########################################
# Private Services Security Group
########################################
resource "aws_security_group" "private_sg" {
  name   = "${var.project_name}-private-sg"
  vpc_id = aws_vpc.qa_vpc.id

  # SSH from Bastion
  ingress {
    description     = "SSH access from Bastion host"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # PostgreSQL
  ingress {
    description = "PostgreSQL internal access"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    self        = true
  }

  # Redis
  ingress {
    description = "Redis internal access"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    self        = true
  }

  # MongoDB
  ingress {
    description = "MongoDB internal access"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    self        = true
  }

  # 🔴 IMPORTANTE: Regla legacy que YA USABAS
  # NO SE ELIMINA
  ingress {
    description = "Internal microservices access (legacy)"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Acceso desde API Gateway
  ingress {
    description     = "HTTP access from API Gateway"
    from_port       = 8000
    to_port         = 9000
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-private-sg"
    Env  = "qa"
    Role = "private-services"
  }
}

########################################
# API Gateway Security Group
########################################
resource "aws_security_group" "gateway_sg" {
  name   = "${var.project_name}-gateway-sg"
  vpc_id = aws_vpc.qa_vpc.id

  ingress {
    description = "Public HTTP access to API Gateway"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTPS access to API Gateway"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "SSH access from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-gateway-sg"
    Env  = "qa"
    Role = "api-gateway"
  }
}
