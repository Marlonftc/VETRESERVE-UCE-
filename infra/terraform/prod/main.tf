terraform {
  required_version = ">= 1.6.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

locals {
  env = var.env_name

  common_tags = {
    Project = var.project_name
    Env     = local.env
  }

  images = {
    auth_identity         = "${var.dockerhub_namespace}/vetreserve-auth-identity-service:${var.docker_image_tag}"
    user_management       = "${var.dockerhub_namespace}/vetreserve-user-management-service:${var.docker_image_tag}"
    owner_management      = "${var.dockerhub_namespace}/vetreserve-owner-management-service:${var.docker_image_tag}"
    pet_management        = "${var.dockerhub_namespace}/vetreserve-pet-management-service:${var.docker_image_tag}"
    vet_schedule          = "${var.dockerhub_namespace}/vetreserve-vet-schedule-service:${var.docker_image_tag}"
    appointment_management = "${var.dockerhub_namespace}/vetreserve-appointment-management-service:${var.docker_image_tag}"
    clinical_records      = "${var.dockerhub_namespace}/vetreserve-clinical-records-service:${var.docker_image_tag}"
    notification          = "${var.dockerhub_namespace}/vetreserve-notification-service:${var.docker_image_tag}"
    integration_automation = "${var.dockerhub_namespace}/vetreserve-integration-automation-service:${var.docker_image_tag}"
    reporting_analytics   = "${var.dockerhub_namespace}/vetreserve-reporting-analytics-service:${var.docker_image_tag}"
  }

  user_data_base = <<-EOF
    #!/bin/bash
    set -e

    dnf update -y || true

    dnf install -y docker git htop unzip curl
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    mkdir -p /usr/libexec/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
      -o /usr/libexec/docker/cli-plugins/docker-compose
    chmod +x /usr/libexec/docker/cli-plugins/docker-compose

    echo "Base system ready"
  EOF

  user_data_gateway = <<-EOF
    #!/bin/bash
    set -e

    ${local.user_data_base}

    mkdir -p /opt/vetreserve/nginx

    cat > /opt/vetreserve/nginx/nginx.conf <<'NGINX'
    worker_processes 1;

    events {
      worker_connections 1024;
    }

    http {
      include       /etc/nginx/mime.types;
      default_type  application/json;
      sendfile on;
      keepalive_timeout 65;

      upstream frontend_app {
        server vetreserve-frontend:80;
      }

      server {
        listen 80;
        client_max_body_size 20m;

        location = /health {
          return 200 '{"status":"ok","gateway":"nginx","env":"prod"}';
        }

        location /api/users/ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;
          proxy_pass http://${aws_instance.app.private_ip}:8001/users/;
        }

        location /api/auth/ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;
          proxy_pass http://${aws_instance.app.private_ip}:8000/auth/;
        }

        location ~ ^/api/owners(/.*)?$ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/owners/?$ /owners/ break;
          rewrite ^/api/owners/(.+)$ /owners/$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8005;
        }

        location ~ ^/api/pets(/.*)?$ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/pets/?$ /pets/ break;
          rewrite ^/api/pets/(.+)$ /pets/$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8006;
        }

        location ~ ^/api/vet-schedules(/.*)?$ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/vet-schedules/?$ /schedules break;
          rewrite ^/api/vet-schedules/(.+)$ /schedules/$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8003;
        }

        location ~ ^/api/appointments(/.*)?$ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/appointments/?$ /appointments break;
          rewrite ^/api/appointments/(.+)$ /appointments/$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8004;
        }

        location ~ ^/api/clinical-records(/.*)?$ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/clinical-records/?$ /clinical-records break;
          rewrite ^/api/clinical-records/(.+)$ /clinical-records/$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8008;
        }

        location /api/notifications/health {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header Authorization $http_authorization;
          proxy_pass http://${aws_instance.app.private_ip}:8007/health;
        }

        location /api/analytics/ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;

          rewrite ^/api/analytics/?$ / break;
          rewrite ^/api/analytics/(.+)$ /$1 break;
          proxy_pass http://${aws_instance.app.private_ip}:8010;
        }

        location /api/webhooks/ {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Authorization $http_authorization;
          proxy_redirect off;
          proxy_pass http://${aws_instance.app.private_ip}:8009/webhooks/;
        }

        location / {
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_redirect off;
          proxy_pass http://frontend_app;
        }
      }
    }
    NGINX

    until docker info >/dev/null 2>&1; do
      echo "[GATEWAY] Waiting for Docker..."
      sleep 3
    done

    docker network inspect vetreserve-gateway >/dev/null 2>&1 || docker network create vetreserve-gateway

    docker pull ${var.frontend_image}
    docker pull nginx:1.27

    docker rm -f vetreserve-frontend >/dev/null 2>&1 || true
    docker rm -f vetreserve-api-gateway >/dev/null 2>&1 || true

    docker run -d --restart unless-stopped \
      --name vetreserve-frontend \
      --network vetreserve-gateway \
      ${var.frontend_image}

    docker run -d --restart unless-stopped \
      --name vetreserve-api-gateway \
      --network vetreserve-gateway \
      -p 80:80 \
      -v /opt/vetreserve/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
      nginx:1.27
  EOF

  user_data_app = <<-EOF
    #!/bin/bash
    set -e

    ${local.user_data_base}

    DATA_HOST="${aws_instance.data.private_ip}"
    EVENTING_HOST="${aws_instance.eventing_core.private_ip}"

    until docker info >/dev/null 2>&1; do
      echo "[APP] Waiting for Docker..."
      sleep 3
    done

    docker network inspect vetreserve-prod >/dev/null 2>&1 || docker network create vetreserve-prod

    wait_for_port() {
      local host=$1
      local port=$2
      local name=$3
      for i in {1..40}; do
        if (echo > /dev/tcp/$host/$port) >/dev/null 2>&1; then
          echo "[APP] $name is ready"
          return 0
        fi
        echo "[APP] Waiting for $name ($host:$port)..."
        sleep 5
      done
      echo "[APP] Timeout waiting for $name"
      return 1
    }

    wait_for_port "$DATA_HOST" 5432 "PostgreSQL"
    wait_for_port "$DATA_HOST" 27017 "MongoDB"
    wait_for_port "$DATA_HOST" 6379 "Redis"
    wait_for_port "$EVENTING_HOST" 9092 "Kafka"
    wait_for_port "$EVENTING_HOST" 5672 "RabbitMQ"

    docker pull ${local.images.user_management}
    docker pull ${local.images.auth_identity}
    docker pull ${local.images.owner_management}
    docker pull ${local.images.pet_management}
    docker pull ${local.images.vet_schedule}
    docker pull ${local.images.appointment_management}
    docker pull ${local.images.clinical_records}
    docker pull ${local.images.notification}
    docker pull ${local.images.integration_automation}
    docker pull ${local.images.reporting_analytics}

    docker rm -f user-management-service auth-identity-service owner-management-service \
      pet-management-service vet-schedule-service appointment-management-service \
      clinical-records-service notification-service integration-automation-service \
      reporting-analytics-service >/dev/null 2>&1 || true

    docker run -d --restart unless-stopped \
      --name user-management-service \
      --network vetreserve-prod \
      -p 8001:8000 \
      -e DATABASE_URL=postgresql+psycopg2://${var.postgres_user}:${var.postgres_password}@${aws_instance.data.private_ip}:5432/${var.postgres_db_identity} \
      -e ADMIN_EMAIL=${var.admin_email} \
      -e ADMIN_PASSWORD=${var.admin_password} \
      -e JWT_SECRET=${var.jwt_secret} \
      ${local.images.user_management}

    docker run -d --restart unless-stopped \
      --name auth-identity-service \
      --network vetreserve-prod \
      -p 8000:8000 \
      -e JWT_SECRET=${var.jwt_secret} \
      -e USER_MANAGEMENT_BASE_URL=http://user-management-service:8000 \
      ${local.images.auth_identity}

    docker run -d --restart unless-stopped \
      --name owner-management-service \
      --network vetreserve-prod \
      -p 8005:8003 \
      -e DB_HOST=$DATA_HOST \
      -e DB_PORT=5432 \
      -e DB_NAME=${var.postgres_db_client_pet} \
      -e DB_USER=${var.postgres_user} \
      -e DB_PASSWORD=${var.postgres_password} \
      -e AUTH_BASE_URL=http://auth-identity-service:8000 \
      -e JWT_SECRET=${var.jwt_secret} \
      ${local.images.owner_management}

    docker run -d --restart unless-stopped \
      --name pet-management-service \
      --network vetreserve-prod \
      -p 8006:8006 \
      -e DB_HOST=$DATA_HOST \
      -e DB_PORT=5432 \
      -e DB_NAME=${var.postgres_db_client_pet} \
      -e DB_USER=${var.postgres_user} \
      -e DB_PASSWORD=${var.postgres_password} \
      -e KAFKA_BOOTSTRAP_SERVERS=$EVENTING_HOST:9092 \
      -e RABBITMQ_HOST=$EVENTING_HOST \
      -e RABBITMQ_PORT=5672 \
      -e RABBITMQ_USER=${var.rabbitmq_user} \
      -e RABBITMQ_PASSWORD=${var.rabbitmq_password} \
      -e MQTT_BROKER_HOST=$EVENTING_HOST \
      -e MQTT_BROKER_PORT=1883 \
      -e JWT_SECRET=${var.jwt_secret} \
      ${local.images.pet_management}

    docker run -d --restart unless-stopped \
      --name vet-schedule-service \
      --network vetreserve-prod \
      -p 8003:8000 \
      -e DB_ENGINE=postgres \
      -e DB_HOST=$DATA_HOST \
      -e DB_PORT=5432 \
      -e DB_NAME=${var.postgres_db_scheduling} \
      -e DB_USER=${var.postgres_user} \
      -e DB_PASSWORD=${var.postgres_password} \
      -e JWT_SECRET=${var.jwt_secret} \
      ${local.images.vet_schedule}

    docker run -d --restart unless-stopped \
      --name appointment-management-service \
      --network vetreserve-prod \
      -p 8004:8000 \
      -e DATABASE_URL=postgresql+psycopg2://${var.postgres_user}:${var.postgres_password}@${aws_instance.data.private_ip}:5432/${var.postgres_db_appointments} \
      -e JWT_SECRET=${var.jwt_secret} \
      -e VET_SCHEDULE_BASE_URL=http://vet-schedule-service:8000 \
      -e KAFKA_BROKER=$EVENTING_HOST:9092 \
      ${local.images.appointment_management}

    docker run -d --restart unless-stopped \
      --name clinical-records-service \
      --network vetreserve-prod \
      -p 8008:8000 \
      -e MONGO_HOST=$DATA_HOST \
      -e MONGO_PORT=27017 \
      -e MONGO_DB=${var.mongo_db} \
      -e KAFKA_BOOTSTRAP_SERVERS=$EVENTING_HOST:9092 \
      -e KAFKA_ENABLED=${var.kafka_enabled} \
      -e KAFKA_CONSUMER_GROUP=clinical-records-service \
      -e RABBITMQ_HOST=$EVENTING_HOST \
      -e RABBITMQ_PORT=5672 \
      -e RABBITMQ_USER=${var.rabbitmq_user} \
      -e RABBITMQ_PASSWORD=${var.rabbitmq_password} \
      -e RABBITMQ_EXCHANGE=clinical.events \
      -e RABBITMQ_ROUTING_KEY=clinical.record.created \
      -e N8N_WEBHOOK_URL=http://$EVENTING_HOST:5678${var.n8n_webhook_path} \
      ${local.images.clinical_records}

    docker run -d --restart unless-stopped \
      --name notification-service \
      --network vetreserve-prod \
      -p 8007:8000 \
      -e RABBITMQ_HOST=$EVENTING_HOST \
      -e RABBITMQ_EXCHANGE=clinical.events \
      -e MQTT_BROKER_HOST=$EVENTING_HOST \
      -e MQTT_BROKER_PORT=1883 \
      -e REDIS_HOST=$DATA_HOST \
      -e REDIS_PORT=6379 \
      -e REDIS_DB=0 \
      ${local.images.notification}

    docker run -d --restart unless-stopped \
      --name integration-automation-service \
      --network vetreserve-prod \
      -p 8009:8000 \
      -e SERVICE_NAME="Integration & Automation Service" \
      -e N8N_BASE_URL=http://$EVENTING_HOST:5678 \
      -e N8N_WEBHOOK_PATH=${var.n8n_webhook_path} \
      -e N8N_TIMEOUT_SECONDS=8 \
      ${local.images.integration_automation}

    docker run -d --restart unless-stopped \
      --name reporting-analytics-service \
      --network vetreserve-prod \
      -p 8010:8010 \
      -e SERVICE_NAME=reporting-analytics-service \
      -e RABBITMQ_HOST=$EVENTING_HOST \
      -e RABBITMQ_EXCHANGE=clinical.events \
      -e RABBITMQ_QUEUE=analytics.clinical.records \
      -e RABBITMQ_ROUTING_KEY=clinical.record.created \
      ${local.images.reporting_analytics}
  EOF

  user_data_data = <<-EOF
    #!/bin/bash
    set -e

    ${local.user_data_base}

    DATA_DEVICE=""
    for i in {1..30}; do
      if [ -e /dev/nvme1n1 ]; then
        DATA_DEVICE="/dev/nvme1n1"
        break
      elif [ -e /dev/xvdf ]; then
        DATA_DEVICE="/dev/xvdf"
        break
      fi
      echo "[DATA] Waiting for EBS device..."
      sleep 3
    done

    if [ -z "$DATA_DEVICE" ]; then
      echo "[DATA] No EBS data device found"
      exit 1
    fi

    if ! file -s $DATA_DEVICE | grep -q filesystem; then
      mkfs -t xfs $DATA_DEVICE
    fi

    mkdir -p /data
    mount $DATA_DEVICE /data
    grep -q "$DATA_DEVICE /data" /etc/fstab || echo "$DATA_DEVICE /data xfs defaults,nofail 0 2" >> /etc/fstab

    mkdir -p /data/postgres /data/mongo /data/redis
    mkdir -p /opt/vetreserve/prod/postgres

    cat > /opt/vetreserve/prod/postgres/init.sql <<SQL
    CREATE DATABASE ${var.postgres_db_identity};
    CREATE DATABASE ${var.postgres_db_scheduling};
    CREATE DATABASE ${var.postgres_db_appointments};
    CREATE DATABASE ${var.postgres_db_client_pet};
SQL

    until docker info >/dev/null 2>&1; do
      echo "[DATA] Waiting for Docker..."
      sleep 3
    done

    docker pull postgres:16
    docker pull mongo:6
    docker pull redis:7

    docker rm -f vetreserve-postgres vetreserve-mongodb vetreserve-redis >/dev/null 2>&1 || true

    docker run -d --restart unless-stopped \
      --name vetreserve-postgres \
      -p 5432:5432 \
      -e POSTGRES_USER=${var.postgres_user} \
      -e POSTGRES_PASSWORD=${var.postgres_password} \
      -e POSTGRES_DB=${var.postgres_default_db} \
      -v /data/postgres:/var/lib/postgresql/data \
      -v /opt/vetreserve/prod/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql \
      postgres:16

    docker run -d --restart unless-stopped \
      --name vetreserve-mongodb \
      -p 27017:27017 \
      -v /data/mongo:/data/db \
      mongo:6

    docker run -d --restart unless-stopped \
      --name vetreserve-redis \
      -p 6379:6379 \
      -v /data/redis:/data \
      redis:7
  EOF

  user_data_eventing_core = <<-EOF
    #!/bin/bash
    set -e

    ${local.user_data_base}

    mkdir -p /opt/vetreserve/prod/eventing
    mkdir -p /opt/vetreserve/prod/mosquitto
    mkdir -p /opt/vetreserve/prod/n8n

    PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

    cat > /opt/vetreserve/prod/mosquitto/mosquitto.conf <<'CONF'
    listener 1883
    allow_anonymous true
CONF

    until docker info >/dev/null 2>&1; do
      echo "[EVENTING] Waiting for Docker..."
      sleep 3
    done

    docker network inspect vetreserve-eventing >/dev/null 2>&1 || docker network create vetreserve-eventing

    docker pull confluentinc/cp-zookeeper:7.6.0
    docker pull confluentinc/cp-kafka:7.6.0
    docker pull rabbitmq:3-management
    docker pull eclipse-mosquitto:2
    docker pull n8nio/n8n:latest

    docker rm -f zookeeper kafka rabbitmq mqtt n8n >/dev/null 2>&1 || true

    docker run -d --restart unless-stopped \
      --name zookeeper \
      --network vetreserve-eventing \
      -p 2181:2181 \
      -e ZOOKEEPER_CLIENT_PORT=2181 \
      -e ZOOKEEPER_TICK_TIME=2000 \
      confluentinc/cp-zookeeper:7.6.0

    docker run -d --restart unless-stopped \
      --name kafka \
      --network vetreserve-eventing \
      -p 9092:9092 \
      -e KAFKA_BROKER_ID=1 \
      -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
      -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 \
      -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$PRIVATE_IP:9092 \
      -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
      confluentinc/cp-kafka:7.6.0

    docker run -d --restart unless-stopped \
      --name rabbitmq \
      --network vetreserve-eventing \
      -p 5672:5672 \
      -p 15672:15672 \
      -e RABBITMQ_DEFAULT_USER=${var.rabbitmq_user} \
      -e RABBITMQ_DEFAULT_PASS=${var.rabbitmq_password} \
      rabbitmq:3-management

    docker run -d --restart unless-stopped \
      --name mqtt \
      --network vetreserve-eventing \
      -p 1883:1883 \
      -v /opt/vetreserve/prod/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro \
      eclipse-mosquitto:2

    docker run -d --restart unless-stopped \
      --name n8n \
      --network vetreserve-eventing \
      -p 5678:5678 \
      -e N8N_BASIC_AUTH_ACTIVE=true \
      -e N8N_BASIC_AUTH_USER=${var.n8n_basic_auth_user} \
      -e N8N_BASIC_AUTH_PASSWORD=${var.n8n_basic_auth_password} \
      -e N8N_HOST=$PRIVATE_IP \
      -e N8N_PORT=5678 \
      -e N8N_PROTOCOL=http \
      -v /opt/vetreserve/prod/n8n:/home/node/.n8n \
      n8nio/n8n:latest
  EOF

  user_data_observability = <<-EOF
    #!/bin/bash
    set -e

    ${local.user_data_base}

    OBS_DEVICE=""
    for i in {1..30}; do
      if [ -e /dev/nvme1n1 ]; then
        OBS_DEVICE="/dev/nvme1n1"
        break
      elif [ -e /dev/xvdf ]; then
        OBS_DEVICE="/dev/xvdf"
        break
      fi
      echo "[OBS] Waiting for EBS device..."
      sleep 3
    done

    if [ -n "$OBS_DEVICE" ]; then
      if ! file -s $OBS_DEVICE | grep -q filesystem; then
        mkfs -t xfs $OBS_DEVICE
      fi

      mkdir -p /opt/vetreserve
      mount $OBS_DEVICE /opt/vetreserve
      grep -q "$OBS_DEVICE /opt/vetreserve" /etc/fstab || echo "$OBS_DEVICE /opt/vetreserve xfs defaults,nofail 0 2" >> /etc/fstab
    fi

    mkdir -p /opt/vetreserve/observability

    cat > /opt/vetreserve/observability/prometheus.yml <<PROM
    global:
      scrape_interval: 10s
    scrape_configs:
      - job_name: "reporting-analytics-service"
        metrics_path: /metrics
        static_configs:
          - targets: ["${aws_instance.app.private_ip}:8010"]
PROM

    until docker info >/dev/null 2>&1; do
      echo "[OBS] Waiting for Docker..."
      sleep 3
    done

    docker pull prom/prometheus:latest
    docker pull grafana/grafana:latest

    docker rm -f vetreserve-prometheus vetreserve-grafana >/dev/null 2>&1 || true

    docker run -d --restart unless-stopped \
      --name vetreserve-prometheus \
      -p 9090:9090 \
      -v /opt/vetreserve/observability/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
      -v /opt/vetreserve/observability/prometheus-data:/prometheus \
      prom/prometheus:latest

    docker run -d --restart unless-stopped \
      --name vetreserve-grafana \
      -p 3000:3000 \
      -e GF_SECURITY_ADMIN_USER=${var.n8n_basic_auth_user} \
      -e GF_SECURITY_ADMIN_PASSWORD=${var.n8n_basic_auth_password} \
      -v /opt/vetreserve/observability/grafana-data:/var/lib/grafana \
      grafana/grafana:latest
  EOF
}

# =========================
# NETWORK
# =========================
resource "aws_vpc" "prod_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, { Name = "${var.project_name}-vpc" })
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.prod_vpc.id
  tags   = merge(local.common_tags, { Name = "${var.project_name}-igw" })
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.prod_vpc.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = merge(local.common_tags, { Name = "${var.project_name}-public" })
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.prod_vpc.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.aws_region}a"

  tags = merge(local.common_tags, { Name = "${var.project_name}-private" })
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.prod_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags   = merge(local.common_tags, { Name = "${var.project_name}-nat-eip" })
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id

  tags       = merge(local.common_tags, { Name = "${var.project_name}-nat-gateway" })
  depends_on = [aws_internet_gateway.igw]
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.prod_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_rt.id
}

# =========================
# SECURITY GROUPS
# =========================
resource "aws_security_group" "bastion_sg" {
  name   = "${var.project_name}-bastion-sg"
  vpc_id = aws_vpc.prod_vpc.id

  ingress {
    description = "SSH access"
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

  tags = merge(local.common_tags, { Name = "${var.project_name}-bastion-sg", Role = "bastion" })
}

resource "aws_security_group" "gateway_sg" {
  name   = "${var.project_name}-gateway-sg"
  vpc_id = aws_vpc.prod_vpc.id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "SSH from Bastion"
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

  tags = merge(local.common_tags, { Name = "${var.project_name}-gateway-sg", Role = "api-gateway" })
}

resource "aws_security_group" "private_sg" {
  name   = "${var.project_name}-private-sg"
  vpc_id = aws_vpc.prod_vpc.id

  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  ingress {
    description = "PostgreSQL internal access"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "Redis internal access"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "MongoDB internal access"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "Internal microservices access"
    from_port   = 8000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  ingress {
    description     = "HTTP from API Gateway"
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

  tags = merge(local.common_tags, { Name = "${var.project_name}-private-sg", Role = "private-services" })
}

resource "aws_security_group" "eventing_core_sg" {
  name   = "${var.project_name}-eventing-core-sg"
  vpc_id = aws_vpc.prod_vpc.id

  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  ingress {
    description     = "Kafka"
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.private_sg.id]
  }

  ingress {
    description     = "RabbitMQ"
    from_port       = 5672
    to_port         = 5672
    protocol        = "tcp"
    security_groups = [aws_security_group.private_sg.id]
  }

  ingress {
    description = "RabbitMQ Admin"
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description     = "MQTT"
    from_port       = 1883
    to_port         = 1883
    protocol        = "tcp"
    security_groups = [aws_security_group.private_sg.id]
  }

  ingress {
    description     = "n8n from API Gateway"
    from_port       = 5678
    to_port         = 5678
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${var.project_name}-eventing-core-sg", Role = "eventing-core" })
}

# =========================
# INSTANCES
# =========================
resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.bastion_instance_type
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  key_name               = var.ssh_key_name

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-bastion", Role = "bastion" })
}

resource "aws_eip" "bastion_eip" {
  instance = aws_instance.bastion.id
  domain   = "vpc"
  tags     = merge(local.common_tags, { Name = "${var.project_name}-prod-bastion-eip" })
}

resource "aws_instance" "api_gateway" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.gateway_instance_type
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.gateway_sg.id]
  associate_public_ip_address = true
  key_name                    = var.ssh_key_name
  user_data                   = local.user_data_gateway
  user_data_replace_on_change = true

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-api-gateway", Role = "api-gateway" })
}

resource "aws_eip" "api_gateway_eip" {
  instance = aws_instance.api_gateway.id
  domain   = "vpc"
  tags     = merge(local.common_tags, { Name = "${var.project_name}-prod-api-gateway-eip" })
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.app_instance_type
  subnet_id     = aws_subnet.private_subnet.id

  vpc_security_group_ids = [
    aws_security_group.gateway_sg.id,
    aws_security_group.private_sg.id
  ]

  associate_public_ip_address = true
  key_name                    = var.ssh_key_name

  user_data                   = local.user_data_app
  user_data_replace_on_change = true

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-app", Role = "app" })
}

resource "aws_instance" "data" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.data_instance_type
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_data

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-data", Role = "data" })
}

resource "aws_instance" "messaging" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.messaging_instance_type
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_messaging

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-messaging", Role = "messaging" })
}

resource "aws_instance" "eventing_core" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.eventing_instance_type
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id, aws_security_group.eventing_core_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_eventing_core

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-eventing-core", Role = "eventing-core" })
}

resource "aws_instance" "observability" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.observability_instance_type
  subnet_id                   = aws_subnet.private_subnet.id
  vpc_security_group_ids      = [aws_security_group.private_sg.id]
  associate_public_ip_address = false
  key_name                    = var.ssh_key_name

  user_data = local.user_data_observability

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-observability", Role = "observability" })
}

# =========================
# EBS VOLUMES
# =========================
resource "aws_ebs_volume" "data_volume" {
  availability_zone = aws_instance.data.availability_zone
  size              = var.data_volume_size
  type              = "gp3"

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-data-ebs" })
}

resource "aws_volume_attachment" "data_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.data_volume.id
  instance_id = aws_instance.data.id
}

resource "aws_ebs_volume" "observability_volume" {
  availability_zone = aws_instance.observability.availability_zone
  size              = var.observability_volume_size
  type              = "gp3"

  tags = merge(local.common_tags, { Name = "${var.project_name}-prod-observability-ebs" })
}

resource "aws_volume_attachment" "observability_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.observability_volume.id
  instance_id = aws_instance.observability.id
  skip_destroy = true
}
