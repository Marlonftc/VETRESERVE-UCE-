########################################
# Bastion
########################################
output "bastion_public_ip" {
  description = "Public IP of Bastion Host"
  value       = aws_eip.bastion_eip.public_ip
}

########################################
# QA APP
########################################
output "qa_app_private_ip" {
  description = "Private IP of QA APP instance"
  value       = aws_instance.qa_app.private_ip
}

########################################
# QA DATA
########################################
output "qa_data_private_ip" {
  description = "Private IP of QA DATA instance"
  value       = aws_instance.qa_data.private_ip
}

########################################
# QA MESSAGING
########################################
output "qa_messaging_private_ip" {
  description = "Private IP of QA MESSAGING instance"
  value       = aws_instance.qa_messaging.private_ip
}

########################################
# QA OBSERVABILITY
########################################
output "qa_observability_private_ip" {
  description = "Private IP of QA OBSERVABILITY instance"
  value       = aws_instance.qa_observability.private_ip
}

########################################
# QA API Gateway
########################################
output "qa_api_gateway_public_ip" {
  description = "Public IP of QA API Gateway"
  value       = aws_eip.qa_api_gateway_eip.public_ip
}

output "qa_eventing_core_private_ip" {
  value = aws_instance.qa_eventing_core.private_ip
}


