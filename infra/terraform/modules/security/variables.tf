variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Environment (qa/prod)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "allowed_http_cidr" {
  type        = list(string)
  description = "Allowed CIDRs for HTTP access"
}

variable "ssh_allowed_cidr" {
  description = "Allowed SSH CIDR blocks (QA only)"
  type        = list(string)
  default     = []
}
