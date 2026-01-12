output "redis_private_ip" {
  description = "Private IP address of the Redis instance"
  value       = aws_instance.redis.private_ip
}
