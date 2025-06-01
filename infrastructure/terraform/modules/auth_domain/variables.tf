variable "hosted_zone_id" {
  description = "Route53 zone ID"
  type        = string
}

variable "domain_name" {
  description = "Subdomain (e.g., auth.arenamatic.ca)"
  type        = string
}

variable "alb_listener_arn" {
  description = "ARN of the ALB HTTPS listener"
  type        = string
}

variable "web_prod_target_group_arn" {
  description = "Target group ARN for production frontend"
  type        = string
}

variable "web_staging_target_group_arn" {
  description = "Target group to forward traffic to"
  type        = string
}

variable "certificate_arn" {
  description = "Required: ACM cert to bind to this domain"
  type        = string
}

