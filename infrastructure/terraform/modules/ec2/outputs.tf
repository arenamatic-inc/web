output "alb_dns" {
  value = data.aws_lb.existing.dns_name
}

output "instance_public_ip" {
  value = aws_instance.web.public_ip
}

