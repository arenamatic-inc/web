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

