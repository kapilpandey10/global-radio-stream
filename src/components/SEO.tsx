import { Helmet } from 'react-helmet-async';
import { RadioStation } from '@/types/radio';

interface SEOProps {
  title?: string;
  description?: string;
  station?: RadioStation | null;
  path?: string;
}

export const SEO = ({ title, description, station, path = '/' }: SEOProps) => {
  const baseUrl = 'https://radio.pandeykapil.com.np';
  
  // Dynamic title based on station or page
  const pageTitle = station 
    ? `${station.name} - Live Radio Stream | Mero Radio`
    : title || "Mero Radio – Stream 30,000+ Live Radio Stations Worldwide";
  
  // Dynamic description with station details
  const pageDescription = station
    ? `Listen to ${station.name} live online. ${station.country ? `Broadcasting from ${station.country}` : 'International radio station'}${station.tags ? ` - ${station.tags.split(',').slice(0, 3).join(', ')}` : ''}. Free streaming on Mero Radio.`
    : description || "Listen to 30,000+ live radio stations from every country. Explore the world on a 3D globe, discover local and trending stations, and stream free music, news, and talk radio.";

  // Rich keywords based on station or general
  const keywords = station
    ? `${station.name}, ${station.name} live, ${station.name} online, ${station.name} stream, ${station.country} radio, ${station.tags || 'radio'}, live radio, online radio, internet radio, mero radio`
    : "mero radio, online radio, live radio, world radio, internet radio, radio stations, free radio streaming, radio globe, nepali radio, radio kantipur, radio nepal";

  // Open Graph image - station favicon or default
  const ogImage = station?.favicon || `${baseUrl}/og-image.jpg`;
  const fullUrl = `${baseUrl}${path}`;

  // Structured data for RadioStation
  const structuredData = station ? {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": station.name,
    "url": fullUrl,
    "description": pageDescription,
    "logo": station.favicon,
    "broadcastFrequency": station.codec || "Internet",
    "genre": station.tags?.split(',').map(t => t.trim()),
    "address": {
      "@type": "PostalAddress",
      "addressCountry": station.country
    },
    "sameAs": station.homepage || undefined
  } : {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mero Radio",
    "url": baseUrl,
    "description": pageDescription,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Kapil Pandey",
      "email": "radio@pandeykapil.com.np",
      "url": "https://pandeykapil.com.np"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={station?.name || "Mero Radio"} />
      <meta property="og:site_name" content="Mero Radio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {station && (
        <>
          <meta name="geo.placename" content={station.country} />
          <meta name="geo.position" content={`${station.geo_lat};${station.geo_long}`} />
          <meta name="ICBM" content={`${station.geo_lat}, ${station.geo_long}`} />
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
