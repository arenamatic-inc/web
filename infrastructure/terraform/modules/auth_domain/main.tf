# --- VARIABLES ---
variable "hosted_zone_id" {
  default = "Z1033348N4HZLLC27RD7" # arenamatic.ca
}

variable "domain_name" {
  default = "auth.arenamatic.ca"
}

variable "alb_listener_arn" {
  default = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:listener/app/osc/264beff78c9e001b/960680df7806a150"
}

variable "web_target_group_arn" {
  default = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-tg/720bbe407c227191"
}

# --- ACM CERTIFICATE ---
resource "aws_acm_certificate" "auth_cert" {
  domain_name               = var.domain_name
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.auth_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  name    = each.value.name
  type    = each.value.type
  zone_id = var.hosted_zone_id
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "auth_cert_validation" {
  certificate_arn         = aws_acm_certificate.auth_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

resource "aws_lb_listener_certificate" "auth_cert_binding" {
  listener_arn    = var.alb_listener_arn
  certificate_arn = aws_acm_certificate.auth_cert.arn
  depends_on      = [aws_acm_certificate_validation.auth_cert_validation]
}

# --- ROUTE 53 A RECORD (ALIAS TO ALB) ---
resource "aws_route53_record" "auth_alias" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = "osc-1254457879.ca-central-1.elb.amazonaws.com"
    zone_id                = "ZQSVJUPU6J1EY"
    evaluate_target_health = true
  }
}

# --- ALB LISTENER RULE ---
resource "aws_lb_listener_rule" "auth_forward" {
  listener_arn = var.alb_listener_arn

  action {
    type             = "forward"
    target_group_arn = var.web_target_group_arn
  }

  condition {
    host_header {
      values = [var.domain_name]
    }
  }

  priority = 50
}

