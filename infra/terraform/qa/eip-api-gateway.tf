########################################
# Elastic IP - QA API Gateway
########################################
resource "aws_eip" "qa_api_gateway_eip" {
  instance = aws_instance.qa_api_gateway.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-qa-api-gateway-eip"
    Env  = "qa"
  }
}
