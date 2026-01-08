output "vpc_id" {
  value = module.network.vpc_id
}

output "public_subnets" {
  value = module.network.public_subnet_ids
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

