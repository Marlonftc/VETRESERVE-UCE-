variable "aws_region" {
  description = "AWS region for QA"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "vetreserve-qa"
}

variable "ssh_key_name" {
  description = "AWS Key Pair name for EC2 access"
  type        = string
}


variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH into bastion"
  type        = string
  default     = "0.0.0.0/0" # QA temporal
}

variable "instance_type" {
  description = "EC2 instance type for QA"
  type        = string
  default     = "t3.medium"
}

