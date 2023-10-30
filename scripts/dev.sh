export AWS_ACCESS_KEY_ID="$(stoml ~/.aws/credentials default.aws_access_key_id)"
export AWS_SECRET_ACCESS_KEY="$(stoml ~/.aws/credentials default.aws_secret_access_key)"
export AWS_S3_BUCKET="scriptmaker-dev"
export AWS_DEFAULT_REGION="us-east-1"
export DATABASE_URL="postgres://scriptmaker@localhost:5432/scriptmaker_dev"

npm run start