export const config = {
  project: {
    name: "campusos-api",
  },
  environments: {
    production: {
      services: [
        {
          name: "api",
          source: {
            repo: "cenexusasia/CampusOS",
            branch: "master",
          },
          build: {
            rootDirectory: "apps/api",
          },
          run: "node dist/main",
          variables: {
            DATABASE_URL: "postgresql://postgres:CyPiOxGCp4ijxr7o@db.hozjxvkyeealghcwvkys.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1",
            JWT_SECRET: "campusos-jwt-secret-2026",
            JWT_REFRESH_SECRET: "campusos-jwt-refresh-secret-2026",
            NEXT_PUBLIC_APP_URL: "https://campusos-nu.vercel.app",
            NODE_ENV: "production",
          },
        },
      ],
    },
  },
};
