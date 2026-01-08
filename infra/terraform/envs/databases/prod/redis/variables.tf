variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "vetreserve-uce"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "qa"
}

variable "instance_type" {
  description = "EC2 instance type for Redis"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}
