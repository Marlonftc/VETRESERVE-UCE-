variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "qa"
}

variable "ssh_allowed_cidr" {
  description = "CIDR blocks allowed to SSH into QA instances (TEMP)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
