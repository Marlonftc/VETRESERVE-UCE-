output "mongodb_private_ip" {
  description = "Private IP address of the MongoDB instance"
  value       = aws_instance.mongodb.private_ip
}
