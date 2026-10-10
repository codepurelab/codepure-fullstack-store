provider "aws" {
  region = "us-east-1"
}

# FIX: S3 bucket with encryption and private ACL
resource "aws_s3_bucket" "uploads" {
  bucket = "codepure-store-uploads"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# FIX: Security group with restricted ingress
resource "aws_security_group" "api" {
  name = "ecommerce-api-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# FIX: RDS with encryption, not publicly accessible
resource "aws_db_instance" "main" {
  engine               = "mysql"
  instance_class       = "db.t3.medium"
  username             = "admin"
  password             = var.db_password
  publicly_accessible  = false
  storage_encrypted    = true
  skip_final_snapshot  = false
  deletion_protection  = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

# FIX: EC2 instance with IMDSv2
resource "aws_instance" "api" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  vpc_security_group_ids = [aws_security_group.api.id]
}
