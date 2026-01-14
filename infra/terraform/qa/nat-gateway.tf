# =========================
# NAT Gateway for Private Subnet (QA)
# =========================

# Elastic IP for NAT Gateway
resource "aws_eip" "qa_nat_eip" {
  domain = "vpc"

  tags = {
    Name = "vetreserve-qa-nat-eip"
  }
}

# NAT Gateway (placed in public subnet)
resource "aws_nat_gateway" "qa_nat" {
  allocation_id = aws_eip.qa_nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    Name = "vetreserve-qa-nat-gateway"
  }

  depends_on = [aws_internet_gateway.igw]
}

# Route table for private subnet
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.qa_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.qa_nat.id
  }

  tags = {
    Name = "vetreserve-qa-private-rt"
  }
}

# Associate private subnet with private route table
resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_rt.id
}
