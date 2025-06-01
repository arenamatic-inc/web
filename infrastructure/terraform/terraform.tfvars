vpc_id          = "vpc-061b6313c64aa50e0"
subnet_ids = [
  "subnet-08db9486371a7a6cd",
  "subnet-002549f804d7bc59d",
  "subnet-02b2901fd95d89a0c"
]
key_name        = "steve"
domain_name     = "mysnookerclub.click"
certificate_arn = "arn:aws:acm:ca-central-1:551424801715:certificate/0ece52fc-9de5-4cf4-b933-91f13d67c77d"
web_staging_target_group_arn = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-tg/720bbe407c227191"
web_prod_target_group_arn    = "arn:aws:elasticloadbalancing:ca-central-1:551424801715:targetgroup/web-prod-tg/bf6c0ab3d61338fb"

