provider "aws" {
  region = "us-east-1"
}

# VULN: S3 bucket without encryption, public ACL
resource "aws_s3_bucket" "uploads" {
  bucket = "codepure-store-uploads"
  acl    = "public-read-write"

  versioning {
    enabled = false
  }
}

# VULN: Security group with wide-open ingress
resource "aws_security_group" "api" {
  name = "ecommerce-api-sg"

  ingress {
    from_port   = 0
    to_port     = 65535
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

# VULN: RDS without encryption, publicly accessible
resource "aws_db_instance" "main" {
  engine               = "mysql"
  instance_class       = "db.t3.medium"
  username             = "admin"
  password             = "Pr0duction_DB_P@ssw0rd!2024"
  publicly_accessible  = true
  storage_encrypted    = false
  skip_final_snapshot  = true
  deletion_protection  = false
}

# VULN: EC2 instance with IMDSv1
resource "aws_instance" "api" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "optional"
  }

  vpc_security_group_ids = [aws_security_group.api.id]
}
