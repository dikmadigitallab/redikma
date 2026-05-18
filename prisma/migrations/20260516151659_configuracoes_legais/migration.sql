-- CreateTable
CREATE TABLE "aceite_termos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aceite_termos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aceite_lgpd" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aceite_lgpd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aceite_cookies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "aceite_cookies_pkey" PRIMARY KEY ("id")
);
