locals {
  common_user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system (best effort)
    dnf update -y || true

    # Install Docker
    dnf install -y docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    # Install Docker Compose v2 (Amazon Linux 2023 path)
    mkdir -p /usr/libexec/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
      -o /usr/libexec/docker/cli-plugins/docker-compose
    chmod +x /usr/libexec/docker/cli-plugins/docker-compose

    # Basic tools
    dnf install -y git htop unzip

    echo "EC2 ready for Docker workloads"
  EOF
}
