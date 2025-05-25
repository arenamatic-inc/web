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
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

module "ec2_web_prod" {
  source          = "./modules/ec2_prod"
  vpc_id          = var.vpc_id
  subnet_ids      = var.subnet_ids
  key_name        = var.key_name
  domain_name     = "ottawasnookerclub.com"
  certificate_arn = var.certificate_arn
  ami_id          = data.aws_ami.ubuntu.id
  instance_type   = "t4g.micro"
  instance_count  = 2
}

module "auth_domain" {
  source = "./modules/auth_domain"
  hosted_zone_id         = "Z1033348N4HZLLC27RD7"
  domain_name            = "auth.arenamatic.ca"
  alb_listener_arn       = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:listener/app/osc/264beff78c9e001b/960680df7806a150"
  web_prod_target_group_arn   = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-tg/720bbe407c227191"
  web_staging_target_group_arn = var.web_staging_target_group_arn
  certificate_arn        = "arn:aws:acm:ca-central-1:551424801715:certificate/aabb1c47-3947-471f-a7f2-86551388af1e"

}

module "auth_domain_staging" {
  source                = "./modules/auth_domain"

  hosted_zone_id        = "Z1033348N4HZLLC27RD7"
  domain_name           = "stagingauth.arenamatic.ca"
  alb_listener_arn      = module.auth_domain.alb_listener_arn
  web_prod_target_group_arn   = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-tg/720bbe407c227191"
  web_staging_target_group_arn = var.web_staging_target_group_arn
  certificate_arn       = "arn:aws:acm:ca-central-1:551424801715:certificate/a22b5f29-0e14-4e4d-8380-37fa49ab4271"
}

module "alb_rules" {
  source = "./modules/alb_rules"

  alb_listener_arn              = module.auth_domain.alb_listener_arn
  web_staging_target_group_arn = module.ec2_web.web_target_group_arn
  web_prod_target_group_arn    = module.ec2_web_prod.web_target_group_arn
}

