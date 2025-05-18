provider "aws" {
  region = var.region
}

module "ec2_web" {
  source          = "./modules/ec2"
  vpc_id          = var.vpc_id
  subnet_ids      = var.subnet_ids
  key_name        = var.key_name
  domain_name     = var.domain_name
  certificate_arn = var.certificate_arn
}

module "auth_domain" {
  source = "./modules/auth_domain"

  hosted_zone_id         = "Z1033348N4HZLLC27RD7"
  domain_name            = "auth.arenamatic.ca"
  alb_listener_arn       = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:listener/app/osc/264beff78c9e001b/960680df7806a150"
  web_target_group_arn   = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-tg/720bbe407c227191"
}

