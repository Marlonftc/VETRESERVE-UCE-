########################################
# QA APP - Application Layer (API Gateway)
########################################
resource "aws_instance" "qa_app" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.private_subnet.id

  vpc_security_group_ids = [
    aws_security_group.gateway_sg.id,
    aws_security_group.private_sg.id
  ]

  associate_public_ip_address = true
  key_name                    = var.ssh_key_name

  user_data                   = local.user_data_qa_app
  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-qa-app"
    Env  = "qa"
    Role = "api-gateway"
  }
}

########################################
# QA DATA - Persistence Layer
########################################
resource "aws_instance" "qa_data" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.small"
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_qa_data

  tags = {
    Name = "${var.project_name}-qa-data"
    Env  = "qa"
    Role = "data"
  }
}

########################################
# QA MESSAGING - Async Communication
########################################
resource "aws_instance" "qa_messaging" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.small"
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_qa_messaging

  tags = {
    Name = "${var.project_name}-qa-messaging"
    Env  = "qa"
    Role = "messaging"
  }
}

########################################
# QA OBSERVABILITY - Monitoring & Metrics
########################################
resource "aws_instance" "qa_observability" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_qa_observability

  tags = {
    Name = "${var.project_name}-qa-observability"
    Env  = "qa"
    Role = "observability"
  }
}
