# Despliegue Senti2 en AWS Academy

## Qué hay desplegado

| Recurso | Valor |
|---------|-------|
| Región | us-east-1 |
| Instancia | t2.micro (key pair: `vockey`) |
| IP pública | Ver output de `terraform output app_url` |
| Contenedores | frontend (Nginx + Angular) + backend (Laravel + SQLite) |

---

## Cada vez que abres el laboratorio

Las credenciales de AWS Academy **caducan** al cerrar la sesión. La EC2 sigue viva, pero necesitas credenciales nuevas para que Terraform pueda gestionarla.

**Pasos:**

1. Abre el Learner Lab → **AWS Details** → copia las tres claves
2. En la terminal pega:

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
export AWS_DEFAULT_REGION="us-east-1"
```

3. Comprueba que funcionan:

```bash
aws sts get-caller-identity
```

A partir de ahí puedes usar Terraform con normalidad.

---

## Comandos habituales

```bash
cd Senti2/infra

# Ver la IP y URL actuales
terraform output

# Recrear todo desde cero (destruye y vuelve a crear la EC2)
terraform destroy -auto-approve -var="github_token=TU_TOKEN"
terraform apply  -auto-approve -var="github_token=TU_TOKEN"

# Al terminar el proyecto (liberar recursos)
terraform destroy -auto-approve -var="github_token=TU_TOKEN"
```

---

## Si la EC2 está bien pero quieres ver los logs de Docker

```bash
ssh -i labsuser.pem ubuntu@IP \
  "sudo docker compose -f /app/Senti2/docker-compose.yml logs -f"
```

---

## Token de GitHub

El token se pasa siempre como variable, nunca se guarda en el repo:

```bash
terraform apply -var="github_token=ghp_..."
```

Si caduca, genera uno nuevo en:  
GitHub → Settings → Developer settings → Personal access tokens → permiso `repo`
