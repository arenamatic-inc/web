resource "aws_lb_listener_rule" "web_staging" {
  listener_arn = var.alb_listener_arn
  priority     = 55

  action {
    type             = "forward"
    target_group_arn = var.web_staging_target_group_arn
  }

  condition {
    host_header {
      values = ["wwwstaging.*"]
    }
  }
}

