output "vpc_id" {
  value = aws_vpc.prod_vpc.id
}

output "public_subnet_id" {
  value = aws_subnet.public_subnet.id
}

output "private_subnet_id" {
  value = aws_subnet.private_subnet.id
}

output "bastion_public_ip" {
  value = aws_eip.bastion_eip.public_ip
}

output "api_gateway_public_ip" {
  value = aws_eip.api_gateway_eip.public_ip
}

output "app_private_ip" {
  value = aws_instance.app.private_ip
}

output "data_private_ip" {
  value = aws_instance.data.private_ip
}

output "eventing_private_ip" {
  value = aws_instance.eventing_core.private_ip
}

output "observability_private_ip" {
  value = aws_instance.observability.private_ip
}
