# Senti2 en AWS Academy — un solo archivo Terraform.
# Ajusta las variables de abajo o crea terraform.tfvars (opcional).
# También necesitas: user-data.sh.tpl y files/nginx-senti2.conf

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# --- Variables (cambia aquí o en terraform.tfvars) ---

variable "aws_region" {
  type    = string
  default = "us-west-2"
}

variable "project_name" {
  type    = string
  default = "senti2"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  type    = string
  default = "labsuser"
}

variable "ssh_allowed_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "github_repo_url" {
  type    = string
  default = "https://github.com/Holasoymartin25/Senti2.git"
}

variable "github_branch" {
  type    = string
  default = "main"
}

variable "app_install_root" {
  type    = string
  default = "/var/www/senti2"
}

# --- Provider ---

provider "aws" {
  region = var.aws_region
}

# --- Datos ---

data "aws_vpc" "default" {
  default = true
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- Recursos ---

resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-"
  description = "HTTP y SSH para Senti2"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg" }
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.app.id]
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user-data.sh.tpl", {
    github_repo_url  = var.github_repo_url
    github_branch    = var.github_branch
    app_install_root = var.app_install_root
  })

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = { Name = "${var.project_name}-app" }
}

resource "aws_eip" "app" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-eip" }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}

# --- Salidas ---

output "app_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "ssh_command" {
  value = "ssh -i labsuser.pem ubuntu@${aws_eip.app.public_ip}"
}
