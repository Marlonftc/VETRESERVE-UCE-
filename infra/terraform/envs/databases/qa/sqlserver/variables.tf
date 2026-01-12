variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "vetreserve-uce"
}

variable "environment" {
  type    = string
  default = "qa"
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "key_name" {
  type = string
}

variable "sa_password" {
  type      = string
  sensitive = true
}
