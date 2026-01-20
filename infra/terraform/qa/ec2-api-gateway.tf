########################################
# QA API Gateway (Dedicated)
########################################
resource "aws_instance" "qa_api_gateway" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.gateway_sg.id]

  associate_public_ip_address = true
  key_name                    = var.ssh_key_name

  user_data                   = file("user-data-gateway.sh")
  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-qa-api-gateway"
    Env  = "qa"
    Role = "api-gateway"
  }
}
