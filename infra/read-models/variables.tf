variable "aws_region" {
  description = "AWS region for the S3 bucket and IAM resources."
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name used for resource names and tags."
  type        = string
  default     = "nextjs-hockey"
}

variable "environment" {
  description = "Environment name used for resource names and tags."
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name. Leave null to derive one from project_name, environment, and account ID."
  type        = string
  default     = null
}

variable "read_model_prefix" {
  description = "S3 key prefix where read-model JSON files are uploaded."
  type        = string
  default     = "hockey-read-models"

  validation {
    condition     = length(trim(var.read_model_prefix, "/")) > 0
    error_message = "read_model_prefix must not be empty."
  }
}

variable "cloudfront_price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition = contains(
      ["PriceClass_100", "PriceClass_200", "PriceClass_All"],
      var.cloudfront_price_class
    )
    error_message = "cloudfront_price_class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "cloudfront_aliases" {
  description = "Optional custom domains for the CloudFront distribution."
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 when using cloudfront_aliases. Leave null for the default CloudFront certificate."
  type        = string
  default     = null
}

variable "create_publisher_user" {
  description = "Whether to create an IAM user for the ETL publisher. Access keys are intentionally not created in Terraform state."
  type        = bool
  default     = false
}

variable "publisher_user_name" {
  description = "IAM user name to create when create_publisher_user is true."
  type        = string
  default     = "hockey-read-model-publisher"
}

variable "tags" {
  description = "Additional tags to apply to resources."
  type        = map(string)
  default     = {}
}
