variable "aws_region" {
  description = "Región AWS (la del Learner Lab, p. ej. us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefijo de recursos."
  type        = string
  default     = "senti2"
}

variable "instance_type" {
  description = "Tipo de instancia EC2 (t3.micro o t2.micro en Academy)."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Nombre del key pair creado en la consola AWS (sin .pem)."
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR permitido para SSH (tu IP pública con /32, p. ej. 203.0.113.10/32)."
  type        = string
}

variable "github_repo_url" {
  description = "URL HTTPS del repositorio (público o con token en la URL si es privado)."
  type        = string
}

variable "github_branch" {
  description = "Rama a desplegar."
  type        = string
  default     = "main"
}

variable "app_install_root" {
  description = "Directorio raíz de la aplicación en la EC2."
  type        = string
  default     = "/var/www/senti2"
}
