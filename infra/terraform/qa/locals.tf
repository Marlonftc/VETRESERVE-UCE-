locals {
  user_data_qa_eventing_core = <<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y docker
    systemctl enable docker
    systemctl start docker

    usermod -aG docker ec2-user

    curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) \
      -o /usr/local/bin/docker-compose

    chmod +x /usr/local/bin/docker-compose
  EOF
}
