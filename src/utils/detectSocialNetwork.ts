import { socialNetworksType } from "@custom-types/socialNetworks";

type socialNetworks= Record<socialNetworksType, RegExp>

export function detectSocialNetWork(url:string): socialNetworksType | null {
    const socialNetworks:socialNetworks = {
      tiktok: /^(https?:\/\/)?([a-z0-9\-]+\.)*tiktok\.com\//i,
      x: /^(https?:\/\/)?([a-z0-9\-]+\.)*(x\.com|twitter\.com)\//i,
      youtube: /^(https?:\/\/)?([a-z0-9\-]+\.)*(youtube\.com|youtu\.be)\//i,
      instagram: /^(https?:\/\/)?([a-z0-9\-]+\.)*instagram\.com\//i
    };
  
    for (const [name, regex] of Object.entries(socialNetworks)) {
      if (regex.test(url)) return name as socialNetworksType;
    }
  
    return null;
  }
  