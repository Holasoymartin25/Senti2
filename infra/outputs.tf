output "instance_id" {
  description = "ID de la instancia EC2."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "IP pública (Elastic IP) de la aplicación."
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "URL del frontend y API (mismo origen)."
  value       = "http://${aws_eip.app.public_ip}"
}

output "api_url" {
  description = "URL base de la API REST."
  value       = "http://${aws_eip.app.public_ip}/api/v1"
}

output "ssh_command" {
  description = "Comando para conectar por SSH (sustituye la ruta del .pem)."
  value       = "ssh -i <tu-clave>.pem ubuntu@${aws_eip.app.public_ip}"
}

output "deploy_log_hint" {
  description = "Comando para ver el progreso del despliegue automático."
  value       = "ssh -i <tu-clave>.pem ubuntu@${aws_eip.app.public_ip} 'sudo tail -f /var/log/senti2-user-data.log'"
}
