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
  # QA APP (IMMUTABLE - APPLICATION CORE)
  ########################################
  user_data_qa_app = <<-EOF
    #!/bin/bash
    set -e

    echo "[QA-APP] Cloud-init started"

    ${local.common_user_data}

    echo "[QA-APP] Initializing QA APP instance"

    mkdir -p /opt/vetreserve/qa/app

    # Wait for Docker to be ready
    until docker info >/dev/null 2>&1; do
      echo "[QA-APP] Waiting for Docker..."
      sleep 3
    done

    echo "[QA-APP] Docker is ready"

    # Create Docker network if not exists
    docker network inspect vetreserve-qa >/dev/null 2>&1 || \
      docker network create vetreserve-qa

    # Pull images
    docker pull mftc2412/vetreserve-auth-identity-service:qa
    docker pull mftc2412/vetreserve-user-management-service:qa
    docker pull mftc2412/vetreserve-vet-schedule-service:qa
    docker pull mftc2412/vetreserve-appointment-management-service:qa

    # USER MANAGEMENT SERVICE (DB + ADMIN BOOTSTRAP)
    docker run -d --restart always \
      --name user-management-service \
      --network vetreserve-qa \
      -p 8001:8000 \
      -e DATABASE_URL=postgresql://vetreserve:vetreserve123@10.0.2.9:5432/vetreserve_qa \
      -e ADMIN_EMAIL=admin@vetreserve.com \
      -e ADMIN_PASSWORD=Admin123* \
      -e JWT_SECRET=vetreserve-qa-secret \
      mftc2412/vetreserve-user-management-service:qa

    # AUTH IDENTITY SERVICE (STATELESS)
    docker run -d --restart always \
      --name auth-identity-service \
      --network vetreserve-qa \
      -p 8000:8000 \
      -e JWT_SECRET=vetreserve-qa-secret \
      -e USER_MANAGEMENT_BASE_URL=http://user-management-service:8000 \
      mftc2412/vetreserve-auth-identity-service:qa

    # VET SCHEDULE SERVICE
    docker run -d --restart always \
      --name vet-schedule-service \
      --network vetreserve-qa \
      -p 8002:8000 \
      -e DATABASE_URL=postgresql://vetreserve:vetreserve123@10.0.2.9:5432/vetreserve_qa \
      mftc2412/vetreserve-vet-schedule-service:qa

    # APPOINTMENT MANAGEMENT SERVICE
    docker run -d --restart always \
      --name appointment-management-service \
      --network vetreserve-qa \
      -p 8003:8000 \
      -e DATABASE_URL=postgresql://vetreserve:vetreserve123@10.0.2.9:5432/vetreserve_qa \
      mftc2412/vetreserve-appointment-management-service:qa

    echo "[QA-APP] Application services started successfully"
  EOF


  ########################################
  # QA DATA (PERSISTENT)
  ########################################
  user_data_qa_data = <<-EOF
    ${local.common_user_data}

    echo "Initializing QA DATA instance"

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

    if ! file -s $DATA_DEVICE | grep -q filesystem; then
      mkfs -t xfs $DATA_DEVICE
    fi

    mkdir -p /data
    mount $DATA_DEVICE /data

    grep -q "$DATA_DEVICE /data" /etc/fstab || echo "$DATA_DEVICE /data xfs defaults,nofail 0 2" >> /etc/fstab

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
  # QA OBSERVABILITY (PERSISTENT)
  ########################################
  user_data_qa_observability = <<-EOF
    ${local.common_user_data}

    echo "Initializing QA OBSERVABILITY instance"

    OBS_DEVICE=""

    if [ -e /dev/nvme1n1 ]; then
      OBS_DEVICE="/dev/nvme1n1"
    elif [ -e /dev/xvdf ]; then
      OBS_DEVICE="/dev/xvdf"
    else
      echo "No EBS observability device found yet"
    fi

    if [ -n "$OBS_DEVICE" ]; then
      echo "Using observability device: $OBS_DEVICE"

      if ! file -s $OBS_DEVICE | grep -q filesystem; then
        mkfs -t xfs $OBS_DEVICE
      fi

      mkdir -p /opt/vetreserve
      mount $OBS_DEVICE /opt/vetreserve

      grep -q "$OBS_DEVICE /opt/vetreserve" /etc/fstab || echo "$OBS_DEVICE /opt/vetreserve xfs defaults,nofail 0 2" >> /etc/fstab

      mkdir -p /opt/vetreserve/nginx
      mkdir -p /opt/vetreserve/env
      mkdir -p /opt/vetreserve/run
      mkdir -p /opt/vetreserve/qa/observability
      chmod -R 755 /opt/vetreserve

      echo "QA OBSERVABILITY persistence ready at /opt/vetreserve"
    fi
  EOF
}
