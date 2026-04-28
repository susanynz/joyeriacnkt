# Nice Joyería — Tienda Web3

Ecommerce de joyería con pagos en CNKT+ y USDT en Polygon.
Stack: **Next.js 14** (App Router + API Routes) + Prisma + PostgreSQL.
Deploy: **Hostinger Node.js** — un solo proceso, sin backend separado.

## Estructura
```
/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── productos/                # Catálogo
│   ├── producto/[id]/            # Detalle
│   ├── nosotros/                 # Sobre nosotros
│   ├── checkout/                 # Pago con crypto
│   ├── admin/                    # Panel de administración
│   └── api/                      # API Routes (backend)
├── components/                   # Navbar, ProductCard, CheckoutForm
├── lib/                          # prisma, auth, crypto, blockchain, prices, wagmi, api
└── prisma/schema.prisma
```

## Setup local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

Generar `ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Base de datos
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Correr en desarrollo
```bash
npm run dev
# http://localhost:3000
# API en http://localhost:3000/api/*
```

## Deploy en Hostinger

1. Subir repositorio via Git en panel Hostinger → Node.js
2. Configurar variables de entorno en Hostinger → Environment Variables
3. Crear PostgreSQL en Hostinger → Databases, copiar connection string a `DATABASE_URL`
4. Hostinger ejecuta automáticamente:
   ```bash
   npm run build   # prisma generate + next build
   npm run start   # next start
   ```

## Categorías iniciales recomendadas
Crear desde `/admin/categorias`:
- **Anillos** (slug: anillos, hasColors: true)
- **Collares** (slug: collares, hasColors: true)
- **Aretes** (slug: aretes, hasColors: true)
- **Pulseras** (slug: pulseras, hasColors: true)

## Tokens aceptados
| Token | Red     | Dirección                                    |
|-------|---------|----------------------------------------------|
| CNKT+ | Polygon | 0x87bdfbe98ba55104701b2f2e999982a317905637   |
| USDT  | Polygon | 0xc2132D05D31c914a87C6611C10748AEb04B58e8F   |

## Envíos
- México: $180 MXN (configurable desde `/admin/configuracion`)
- USA: configurable desde admin una vez tengas el costo definido
