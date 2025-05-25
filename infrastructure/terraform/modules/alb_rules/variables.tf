variable "alb_listener_arn" {
  description = "ARN of the ALB HTTPS listener"
  type        = string
}

variable "web_staging_target_group_arn" {
  description = "Target group ARN for staging frontend"
  type        = string
}

variable "web_prod_target_group_arn" {
  description = "Target group ARN for production frontend"
  type        = string
}

