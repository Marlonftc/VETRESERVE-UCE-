variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "vetreserve"
}

variable "env_name" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ssh_key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Public subnet CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "Private subnet CIDR"
  type        = string
  default     = "10.0.2.0/24"
}

variable "bastion_instance_type" {
  description = "Bastion instance type"
  type        = string
  default     = "t3.micro"
}

variable "gateway_instance_type" {
  description = "API Gateway instance type"
  type        = string
  default     = "t3.micro"
}

variable "app_instance_type" {
  description = "App instance type"
  type        = string
  default     = "t3.medium"
}

variable "data_instance_type" {
  description = "Data instance type"
  type        = string
  default     = "t3.small"
}

variable "messaging_instance_type" {
  description = "Messaging instance type"
  type        = string
  default     = "t3.small"
}

variable "eventing_instance_type" {
  description = "Eventing core instance type"
  type        = string
  default     = "t3.medium"
}

variable "observability_instance_type" {
  description = "Observability instance type"
  type        = string
  default     = "t3.micro"
}

variable "data_volume_size" {
  description = "EBS volume size for data instance (GB)"
  type        = number
  default     = 50
}

variable "observability_volume_size" {
  description = "EBS volume size for observability instance (GB)"
  type        = number
  default     = 20
}

variable "dockerhub_namespace" {
  description = "Docker Hub namespace for backend images"
  type        = string
  default     = "mftc2412"
}

variable "docker_image_tag" {
  description = "Docker image tag for backend services"
  type        = string
  default     = "qa"
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
  default     = "mftc2412/vetreserve-frontend:qa"
}

variable "jwt_secret" {
  description = "Shared JWT secret across services"
  type        = string
  default     = "vetreserve-prod-secret"
}

variable "admin_email" {
  description = "Bootstrap admin email for user-management-service"
  type        = string
  default     = "admin@vetreserve.com"
}

variable "admin_password" {
  description = "Bootstrap admin password for user-management-service"
  type        = string
  default     = "Admin123*"
}

variable "postgres_user" {
  description = "PostgreSQL user"
  type        = string
  default     = "vetreserve"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  default     = "vetreserve123"
}

variable "postgres_default_db" {
  description = "Default Postgres database"
  type        = string
  default     = "postgres"
}

variable "postgres_db_identity" {
  description = "Database name for identity-access"
  type        = string
  default     = "identity_access_db"
}

variable "postgres_db_client_pet" {
  description = "Database name for client & pet domain"
  type        = string
  default     = "client_pet_db"
}

variable "postgres_db_scheduling" {
  description = "Database name for scheduling domain"
  type        = string
  default     = "scheduling_db"
}

variable "postgres_db_appointments" {
  description = "Database name for appointments domain"
  type        = string
  default     = "appointments_db"
}

variable "mongo_db" {
  description = "MongoDB database name for clinical records"
  type        = string
  default     = "clinical_db"
}

variable "rabbitmq_user" {
  description = "RabbitMQ default user"
  type        = string
  default     = "guest"
}

variable "rabbitmq_password" {
  description = "RabbitMQ default password"
  type        = string
  default     = "guest"
}

variable "n8n_basic_auth_user" {
  description = "n8n basic auth username"
  type        = string
  default     = "admin"
}

variable "n8n_basic_auth_password" {
  description = "n8n basic auth password"
  type        = string
  default     = "admin"
}

variable "n8n_webhook_path" {
  description = "n8n webhook path for clinical record created events"
  type        = string
  default     = "/webhook/clinical-record-created"
}

variable "kafka_enabled" {
  description = "Enable Kafka consumer for clinical-records-service"
  type        = bool
  default     = true
}
