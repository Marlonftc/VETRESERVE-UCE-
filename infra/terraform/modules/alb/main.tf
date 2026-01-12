resource "aws_lb" "this" {
  name               = "${var.project_name}-${var.environment}-${var.domain_short}-alb"
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-${var.domain}-alb"
    Environment = var.environment
    Domain      = var.domain
    ManagedBy   = "Terraform"
  }
}

resource "aws_lb_target_group" "this" {
  name        = "${var.project_name}-${var.environment}-${var.domain_short}-tg"
  port        = var.target_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    path                = "/health"
    matcher             = "200"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-${var.domain}-tg"
    Environment = var.environment
    Domain      = var.domain
    ManagedBy   = "Terraform"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}
