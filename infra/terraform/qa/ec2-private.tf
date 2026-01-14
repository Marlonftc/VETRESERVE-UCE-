resource "aws_instance" "private_services" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.medium"
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids       = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.common_user_data

  tags = {
    Name = "${var.project_name}-qa-private-services"
    Env  = "qa"
  }
}
