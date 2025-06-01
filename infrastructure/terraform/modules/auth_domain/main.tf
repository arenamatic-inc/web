resource "aws_lb_listener_rule" "auth_prod" {
  listener_arn = var.alb_listener_arn
  priority     = 50

  action {
    type             = "forward"
    target_group_arn = var.web_prod_target_group_arn
  }

  condition {
    host_header {
      values = ["auth.arenamatic.ca"]
    }
  }
}

resource "aws_lb_listener_rule" "auth_staging" {
  listener_arn = var.alb_listener_arn
  priority     = 54

  action {
    type             = "forward"
    target_group_arn = var.web_staging_target_group_arn
  }

  condition {
    host_header {
      values = ["stagingauth.arenamatic.ca"]
    }
  }
}

