# Deploy to AWS EC2 & Test

## Prerequisites

1. **AWS CLI configured**: Run `aws configure` and enter your Access Key, Secret Key, and region (e.g. `ap-south-1`)
2. **EC2 instance** running (Ubuntu/Amazon Linux)
3. **RDS PostgreSQL** database
4. **Security group** allowing inbound: 22 (SSH), 8080 (app)

---

## Option 1: Deploy via SSH (manual)

### 1. Build locally
```powershell
cd c:\BookMyShow\bookmyshow-golang
go build -o main .
```

### 2. Copy to EC2
```powershell
scp -i "your-key.pem" main ec2-user@ec2-XX-XX-XX-XX.compute.amazonaws.com:~/
scp -i "your-key.pem" .env ec2-user@ec2-XX-XX-XX-XX.compute.amazonaws.com:~/
```

### 3. SSH and run
```bash
ssh -i "your-key.pem" ec2-user@ec2-XX-XX-XX-XX.compute.amazonaws.com
chmod +x main
./main
# Or run in background: nohup ./main > app.log 2>&1 &
```

---

## Option 2: Deploy via Docker

### 1. Build and push to ECR (or use Docker Hub)
```powershell
docker build -t bookmyshow .
docker tag bookmyshow:latest YOUR_ECR_URI/bookmyshow:latest
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com
docker push YOUR_ECR_URI/bookmyshow:latest
```

### 2. On EC2, pull and run
```bash
docker pull YOUR_ECR_URI/bookmyshow:latest
docker run -d -p 8080:8080 --env-file .env bookmyshow:latest
```

---

## Test the deployment

Once the app is running on EC2:

```powershell
$BaseUrl = "http://YOUR_EC2_PUBLIC_IP:8080"
.\scripts\test-api.ps1 -BaseUrl $BaseUrl
```

Or manually:
```powershell
Invoke-WebRequest -Uri "$BaseUrl/movies/" -UseBasicParsing
Invoke-WebRequest -Uri "$BaseUrl/venues/" -UseBasicParsing
```

---

## Quick checklist

- [ ] AWS CLI: `aws configure`
- [ ] EC2 instance running
- [ ] Security group: port 8080 open
- [ ] RDS accessible from EC2
- [ ] `.env` file with DB_URL, SECRET, Twilio, AWS keys
- [ ] App running: `./main` or `docker run`
