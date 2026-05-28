data "aws_caller_identity" "current" {}

locals {
  name_prefix       = replace(lower("${var.project_name}-${var.environment}"), "_", "-")
  bucket_name       = var.bucket_name != null && trimspace(var.bucket_name) != "" ? var.bucket_name : "${local.name_prefix}-read-models-${data.aws_caller_identity.current.account_id}"
  read_model_prefix = trim(var.read_model_prefix, "/")

  tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

resource "aws_s3_bucket" "read_models" {
  bucket = local.bucket_name

  tags = local.tags
}

resource "aws_s3_bucket_public_access_block" "read_models" {
  bucket = aws_s3_bucket.read_models.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "read_models" {
  bucket = aws_s3_bucket.read_models.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "read_models" {
  bucket = aws_s3_bucket.read_models.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_cloudfront_origin_access_control" "read_models" {
  name                              = "${local.name_prefix}-read-models-oac"
  description                       = "OAC for ${aws_s3_bucket.read_models.bucket}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "read_models" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.name_prefix} hockey read models"
  aliases         = var.cloudfront_aliases
  price_class     = var.cloudfront_price_class

  origin {
    domain_name              = aws_s3_bucket.read_models.bucket_regional_domain_name
    origin_id                = "read-models-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.read_models.id
  }

  default_cache_behavior {
    target_origin_id       = "read-models-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 300
    max_ttl     = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = length(var.cloudfront_aliases) == 0
    acm_certificate_arn            = length(var.cloudfront_aliases) > 0 ? var.acm_certificate_arn : null
    ssl_support_method             = length(var.cloudfront_aliases) > 0 ? "sni-only" : null
    minimum_protocol_version       = length(var.cloudfront_aliases) > 0 ? "TLSv1.2_2021" : "TLSv1"
  }

  lifecycle {
    precondition {
      condition     = length(var.cloudfront_aliases) == 0 || var.acm_certificate_arn != null
      error_message = "acm_certificate_arn is required when cloudfront_aliases is non-empty. CloudFront certificates must be in us-east-1."
    }
  }

  tags = local.tags
}

data "aws_iam_policy_document" "cloudfront_read_bucket" {
  statement {
    sid = "AllowCloudFrontRead"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = [
      "${aws_s3_bucket.read_models.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.read_models.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "read_models" {
  bucket = aws_s3_bucket.read_models.id
  policy = data.aws_iam_policy_document.cloudfront_read_bucket.json

  depends_on = [
    aws_s3_bucket_public_access_block.read_models,
  ]
}

data "aws_iam_policy_document" "publisher" {
  statement {
    sid = "ListReadModelBucket"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.read_models.arn,
    ]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        local.read_model_prefix,
        "${local.read_model_prefix}/*",
      ]
    }
  }

  statement {
    sid = "WriteReadModels"

    actions = [
      "s3:DeleteObject",
      "s3:PutObject",
    ]

    resources = [
      "${aws_s3_bucket.read_models.arn}/${local.read_model_prefix}/*",
    ]
  }

  statement {
    sid = "InvalidateReadModelDistribution"

    actions = [
      "cloudfront:CreateInvalidation",
    ]

    resources = [
      aws_cloudfront_distribution.read_models.arn,
    ]
  }
}

resource "aws_iam_policy" "publisher" {
  name        = "${local.name_prefix}-read-model-publisher"
  description = "Allows ETL to publish hockey read-model JSON to S3 and invalidate CloudFront."
  policy      = data.aws_iam_policy_document.publisher.json

  tags = local.tags
}

resource "aws_iam_user" "publisher" {
  count = var.create_publisher_user ? 1 : 0

  name = var.publisher_user_name
  path = "/service/"

  tags = local.tags
}

resource "aws_iam_user_policy_attachment" "publisher" {
  count = var.create_publisher_user ? 1 : 0

  user       = aws_iam_user.publisher[0].name
  policy_arn = aws_iam_policy.publisher.arn
}
