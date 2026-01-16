locals {

  ########################################
  # COMMON BASE (ALL PRIVATE INSTANCES)
  ########################################
  common_user_data = <<-EOF
    #!/bin/bash
    set -e

    dnf update -y || true

    # Install Docker
    dnf install -y docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    # Install Docker Compose v2
    mkdir -p /usr/libexec/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
      -o /usr/libexec/docker/cli-plugins/docker-compose
    chmod +x /usr/libexec/docker/cli-plugins/docker-compose

    # Basic tools
    dnf install -y git htop unzip

    echo "Base system ready"
  EOF


  ########################################
  # QA APP
  ########################################
  user_data_qa_app = <<-EOF
    ${local.common_user_data}

    echo "Initializing QA APP instance"

    mkdir -p /opt/vetreserve/qa/app
  EOF


########################################
# QA DATA  (PERSISTENT)
########################################
user_data_qa_data = <<-EOF
  ${local.common_user_data}

  echo "Initializing QA DATA instance"

  # Detect EBS device (NVMe or Xen)
  DATA_DEVICE=""

  if [ -e /dev/nvme1n1 ]; then
    DATA_DEVICE="/dev/nvme1n1"
  elif [ -e /dev/xvdf ]; then
    DATA_DEVICE="/dev/xvdf"
  else
    echo "No EBS data device found"
    exit 1
  fi

  echo "Using data device: $DATA_DEVICE"

  # Format disk only if empty
  if ! file -s $DATA_DEVICE | grep -q filesystem; then
    mkfs -t xfs $DATA_DEVICE
  fi

  # Mount to /data
  mkdir -p /data
  mount $DATA_DEVICE /data

  # Persist mount across reboots
  echo "$DATA_DEVICE /data xfs defaults,nofail 0 2" >> /etc/fstab

  # Create persistent directories for databases
  mkdir -p /data/postgres
  mkdir -p /data/mongo
  mkdir -p /data/redis

  chmod -R 755 /data

  mkdir -p /opt/vetreserve/qa/data

  echo "QA DATA persistence ready"
EOF



  ########################################
  # QA MESSAGING
  ########################################
  user_data_qa_messaging = <<-EOF
    ${local.common_user_data}

    echo "Initializing QA MESSAGING instance"

    mkdir -p /opt/vetreserve/qa/messaging
  EOF


  ########################################
  # QA OBSERVABILITY
  ########################################
  user_data_qa_observability = <<-EOF
    ${local.common_user_data}

    echo "Initializing QA OBSERVABILITY instance"

    mkdir -p /opt/vetreserve/qa/observability
  EOF
}
