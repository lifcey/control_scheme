#!/bin/sh
# Подставляем переменные окружения в шаблон и сохраняем в config.js
envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

# Запускаем nginx
exec "$@"