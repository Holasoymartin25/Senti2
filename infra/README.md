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

## Acceso rápido a la instancia

```bash
cd Senti2/infra

# Ver IP/URL y comando SSH desde Terraform
terraform output public_ip
terraform output app_url
terraform output ssh_command
```

También puedes conectar directamente:

```bash
ssh -i labsuser.pem ubuntu@IP_PUBLICA
```

---

## Operación diaria (Docker en la EC2)

Dentro de la EC2:

```bash
cd /app/Senti2

# Ver estado de contenedores
sudo docker compose ps

# Ver logs en tiempo real
sudo docker compose logs -f

# Reiniciar servicios (sin rebuild)
sudo docker compose restart

# Rebuild + despliegue limpio (cuando hay cambios de código)
sudo docker compose down --remove-orphans
sudo docker compose up -d --build
```

Verificación rápida de salud:

```bash
# Desde la EC2
curl -I http://localhost

# Desde tu Mac
curl -I http://IP_PUBLICA
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

---

## Despliegue automático (GitHub Actions)

Al hacer push a `main`, si el **CI** pasa, el workflow **Deploy** actualiza la EC2:

1. `git fetch` + `git reset --hard origin/main` en `/app`
2. `docker compose up -d --build` en `/app/Senti2`

Configura estos **secrets** en el repo  
(GitHub → Settings → Secrets and variables → Actions):

| Secret | Valor |
|--------|--------|
| `EC2_HOST` | IP pública (ej. `44.193.230.31`) |
| `EC2_SSH_KEY` | Contenido completo del archivo `labsuser.pem` |
| `GH_DEPLOY_TOKEN` | PAT de GitHub con permiso `repo` (repo privado) |

También puedes lanzarlo a mano: **Actions → Deploy → Run workflow**.

---

## Si se queda colgado o hay conflicto de contenedores

En algunos redeploys puede aparecer:
- `network with name app_default already exists`
- `container name ... is already in use`

Solución:

```bash
cd /app/Senti2
sudo docker compose down --remove-orphans
sudo docker rm -f app-backend-1 app-frontend-1 2>/dev/null || true
sudo docker network rm app_default 2>/dev/null || true
sudo docker compose up -d --build
sudo docker compose ps
```
