output "s3_bucket_name" {
  description = "S3 bucket for read-model JSON."
  value       = aws_s3_bucket.read_models.bucket
}

output "s3_prefix" {
  description = "S3 key prefix for read-model JSON."
  value       = local.read_model_prefix
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.read_models.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain."
  value       = aws_cloudfront_distribution.read_models.domain_name
}

output "read_model_base_url" {
  description = "Use this value for READ_MODEL_BASE_URL in the Next.js app."
  value       = "https://${aws_cloudfront_distribution.read_models.domain_name}/${local.read_model_prefix}"
}

output "publisher_policy_arn" {
  description = "Attach this policy to the IAM principal that runs the ETL publisher."
  value       = aws_iam_policy.publisher.arn
}

output "publisher_user_name" {
  description = "Optional publisher IAM user name, when create_publisher_user is true."
  value       = var.create_publisher_user ? aws_iam_user.publisher[0].name : null
}
