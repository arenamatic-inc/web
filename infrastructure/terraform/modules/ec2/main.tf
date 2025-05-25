# SECURITY GROUP
resource "aws_security_group" "web_sg" {
  name_prefix = "web-sg-"
  description = "Allow HTTP and HTTPS"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 INSTANCE
resource "aws_instance" "web" {
  ami                    = "ami-08665a6d02e69c483" # Ubuntu 24.04 ARM64
  instance_type          = "t4g.micro"
  subnet_id              = var.subnet_ids[0]
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "web"
  }
}

# ALB
data "aws_lb" "existing" {
  name = "osc"  # Use the exact ALB name (from dropdown or EC2 > Load Balancers)
}

resource "aws_lb_target_group" "web_tg" {
  name         = "web-tg"
  port         = 80
  protocol     = "HTTP"         # ✅ must be HTTP
  vpc_id       = var.vpc_id
  target_type  = "instance"

  health_check {
    protocol = "HTTP"           # ✅ not HTTPS
    path     = "/"              # or a known-good path
    port     = "80"
  }
}

#resource "aws_lb_target_group" "web_tg" {
#  name         = "web-tg"
#  port         = 80
#  protocol     = "HTTP"
#  vpc_id       = var.vpc_id
#  target_type  = "instance"
#}

resource "aws_lb_target_group_attachment" "web_attach" {
  target_group_arn = aws_lb_target_group.web_tg.arn
  target_id        = aws_instance.web.id
  port             = 80
}

# DNS RECORD (replace with your real zone ID)
#resource "aws_route53_record" "web_dns" {
#  zone_id = "Z03549091DYPDZSEYOVZF"
#  name    = var.domain_name
#  type    = "A"
#
#  alias {
#    name                   = data.aws_lb.existing.dns_name
#    zone_id                = data.aws_lb.existing.zone_id
#    evaluate_target_health = true
#  }
#}

