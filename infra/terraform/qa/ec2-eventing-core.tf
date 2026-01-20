########################################
# QA EVENTING CORE - Kafka / Rabbit / MQTT / n8n
########################################
resource "aws_instance" "qa_eventing_core" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = "t3.medium"
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id, aws_security_group.eventing_core_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_qa_eventing_core

  tags = {
    Name = "${var.project_name}-qa-eventing-core"
    Env  = "qa"
    Role = "eventing-core"
  }
}
