## crear la imagen luego de un cambio
```bash
podman build --no-cache -t bot-telegram-coders .
```
## correr contnedor
```bash
podman run -e DB_URI="url que te pasé a telegram" -e INSTAGRAM_DOWNLOADER_URL=https://downloader-ig.vercel.app/api/video   -dp 3000:3000  bot-telegram-coders
```

## ver logs

```bash
podman logs -f [id o nombre contenedor]
```