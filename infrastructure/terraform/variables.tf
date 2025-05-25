variable "region" {
  default = "ca-central-1"
}

variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}
variable "key_name" {}
variable "domain_name" {}
variable "certificate_arn" {}

variable "web_staging_target_group_arn" {
  description = "Staging target group ARN"
  type        = string
}

variable "web_prod_target_group_arn" {
  description = "Production target group ARN"
  type        = string
}

