/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // DESABILITADO para evitar re-renders duplos
  
  // Forçar webpack (sem Turbopack)
  experimental: {
    turbo: false,
  },
  
  // Desabilitar otimizações que podem causar problemas
  swcMinify: false,
  
  // Configuração de imagens (do projeto que funciona)
  images: {
    domains: [
      'images.unsplash.com',
      'supabase.co',
      '*.supabase.co', 
      'eehidnwlwrzqzgytbfsd.supabase.co',
    ], 
    formats: ['image/webp'], // Só webp para simplificar
  },
  
  // Webpack configurado para estabilidade máxima
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configurações ultra conservadoras
      config.watchOptions = {
        poll: 5000, // Polling muito lento
        aggregateTimeout: 2000, // Aguardar 2s antes de rebuild
        ignored: ['**/node_modules/**', '**/.next/**'],
      };
      
      // Limitar paralelismo ao máximo
      config.parallelism = 1;
      
      // Desabilitar cache agressivo
      config.cache = false;
    }
    
    return config;
  },
};

export default nextConfig;