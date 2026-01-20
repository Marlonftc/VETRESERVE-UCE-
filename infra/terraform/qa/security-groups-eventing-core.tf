resource "aws_security_group" "eventing_core_sg" {
  name   = "${var.project_name}-eventing-core-sg"
  vpc_id = aws_vpc.qa_vpc.id

  # SSH solo desde bastion
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # Kafka
  ingress {
    description     = "Kafka access from private services"
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.private_sg.id]
  }

  # RabbitMQ
  ingress {
    from_port = 5672
    to_port   = 5672
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port = 15672
    to_port   = 15672
    protocol  = "tcp"
    self      = true
  }

  # MQTT
  ingress {
    from_port = 1883
    to_port   = 1883
    protocol  = "tcp"
    self      = true
  }

  # n8n
  ingress {
    from_port = 5678
    to_port   = 5678
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eventing-core-sg"
    Env  = "qa"
    Role = "eventing-core"
  }
}
