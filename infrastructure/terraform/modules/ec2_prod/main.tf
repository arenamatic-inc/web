resource "aws_security_group" "web_sg" {
  name_prefix = "web-prod-sg-"
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

resource "aws_instance" "web" {
  count                  = var.instance_count
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = element(var.subnet_ids, count.index % length(var.subnet_ids))
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "web-prod-${count.index}"
  }
}

resource "aws_lb_target_group" "web_tg" {
  name         = "web-prod-tg"
  port         = 80
  protocol     = "HTTP"
  vpc_id       = var.vpc_id
  target_type  = "instance"

  health_check {
    protocol = "HTTP"
    path     = "/"
    port     = "80"
  }
}

resource "aws_lb_target_group_attachment" "web_attach" {
  count            = var.instance_count
  target_group_arn = aws_lb_target_group.web_tg.arn
  target_id        = aws_instance.web[count.index].id
  port             = 80
}

