variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}
variable "key_name" {}
variable "domain_name" {}
variable "certificate_arn" {}
variable "ami_id" {}
variable "instance_type" {
  default = "t4g.micro"
}
variable "instance_count" {
  default = 2
}

