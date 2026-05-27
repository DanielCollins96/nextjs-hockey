# Hockey Read Models Infrastructure

Terraform for the S3 + CloudFront read-model store.

It creates:

- Private S3 bucket for JSON read models
- CloudFront distribution in front of the bucket
- Origin Access Control so the bucket can stay private
- Bucket policy allowing only CloudFront reads
- IAM policy for the ETL publisher
- Optional IAM user for the publisher, without access keys in Terraform state

## Deploy

```bash
cd infra/read-models
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## App Env

After apply, set the app env var from the output:

```bash
terraform output -raw read_model_base_url
```

Use it as:

```bash
READ_MODEL_BASE_URL=https://<cloudfront-domain>/hockey-read-models
```

## ETL Publisher Env

Use these outputs:

```bash
terraform output -raw s3_bucket_name
terraform output -raw s3_prefix
terraform output -raw cloudfront_distribution_id
terraform output -raw publisher_policy_arn
```

Publisher env:

```bash
READ_MODEL_S3_BUCKET=<s3_bucket_name>
READ_MODEL_S3_PREFIX=<s3_prefix>
CLOUDFRONT_DISTRIBUTION_ID=<cloudfront_distribution_id>
CLOUDFRONT_INVALIDATION_MODE=wildcard
```

Attach `publisher_policy_arn` to the IAM principal that runs the ETL.

If you set `create_publisher_user = true`, create an access key for that user outside Terraform:

```bash
aws iam create-access-key --user-name "$(terraform output -raw publisher_user_name)"
```

Store the access key in your ETL runtime secret store. Do not commit it.
