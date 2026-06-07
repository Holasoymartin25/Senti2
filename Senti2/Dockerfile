FROM node:20-alpine AS build
WORKDIR /app
COPY Senti2/package*.json ./
RUN npm ci
COPY Senti2/ .
RUN npm run build -- --configuration=aws

FROM nginx:alpine
COPY --from=build /app/dist/senti2/browser /usr/share/nginx/html
COPY landing/ /usr/share/nginx/html/landing/
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location ^~ /landing/ {\n\
    alias /usr/share/nginx/html/landing/;\n\
    try_files $uri $uri/ /landing/index.html;\n\
  }\n\
  location ^~ /app {\n\
    proxy_pass http://reverb:8080;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header Upgrade $http_upgrade;\n\
    proxy_set_header Connection "Upgrade";\n\
  }\n\
  location ^~ /api {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;\n\
    proxy_set_header X-Forwarded-Host $host;\n\
  }\n\
  location ^~ /panel-admin {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;\n\
    proxy_set_header X-Forwarded-Host $host;\n\
  }\n\
  location ^~ /docs {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;\n\
    proxy_set_header X-Forwarded-Host $host;\n\
  }\n\
  location ^~ /storage {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;\n\
    proxy_set_header X-Forwarded-Host $host;\n\
  }\n\
  location ^~ /broadcasting {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;\n\
    proxy_set_header X-Forwarded-Host $host;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
