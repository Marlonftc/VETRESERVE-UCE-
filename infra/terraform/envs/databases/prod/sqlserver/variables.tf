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
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "sa_password" {
  description = "SQL Server SA password"
  type        = string
  sensitive   = true
}
