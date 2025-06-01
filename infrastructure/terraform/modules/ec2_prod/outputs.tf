output "instance_public_ip" {
  value = aws_instance.web[*].public_ip
}

output "web_target_group_arn" {
  value = aws_lb_target_group.web_tg.arn
}

