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

