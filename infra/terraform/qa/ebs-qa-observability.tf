########################################
# EBS volume for QA OBSERVABILITY persistence
########################################
resource "aws_ebs_volume" "qa_observability_volume" {
  availability_zone = aws_instance.qa_observability.availability_zone
  size              = 20
  type              = "gp3"

  tags = {
    Name = "${var.project_name}-qa-observability-ebs"
    Env  = "qa"
  }
}

########################################
# Attach EBS to QA OBSERVABILITY instance
########################################
resource "aws_volume_attachment" "qa_observability_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.qa_observability_volume.id
  instance_id = aws_instance.qa_observability.id

  # ✅ Mode B: keep volume even if instance is destroyed/recreated
  skip_destroy = true
}
