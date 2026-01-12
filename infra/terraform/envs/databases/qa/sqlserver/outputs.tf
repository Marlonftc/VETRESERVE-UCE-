output "sqlserver_private_ip" {
  description = "Private IP address of the SQL Server instance"
  value       = aws_instance.sqlserver.private_ip
}
