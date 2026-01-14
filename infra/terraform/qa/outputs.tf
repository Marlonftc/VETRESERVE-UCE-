output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}

output "vpc_id" {
  value = aws_vpc.qa_vpc.id
}

output "private_subnet_id" {
  value = aws_subnet.private_subnet.id
}

output "private_services_private_ip" {
  value = aws_instance.private_services.private_ip
}

output "private_services_instance_id" {
  value = aws_instance.private_services.id
}
