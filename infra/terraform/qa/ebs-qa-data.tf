########################################
# EBS volume for QA DATA persistence
########################################
resource "aws_ebs_volume" "qa_data_volume" {
  availability_zone = aws_instance.qa_data.availability_zone
  size              = 50
  type              = "gp3"

  tags = {
    Name = "${var.project_name}-qa-data-ebs"
    Env  = "qa"
  }
}

########################################
# Attach EBS to QA DATA instance
########################################
resource "aws_volume_attachment" "qa_data_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.qa_data_volume.id
  instance_id = aws_instance.qa_data.id
}
