variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain" {
  type = string
}

variable "domain_short" {
  type = string
  description = "Short name to avoid AWS 32 char limit"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "target_port" {
  type = number
}
