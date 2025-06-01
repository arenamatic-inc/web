output "alb_dns" {
  value = module.ec2_web.alb_dns
}

output "instance_public_ip" {
  value = module.ec2_web.instance_public_ip
}

