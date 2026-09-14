import { AvatarId, AvatarOption } from "../types";
import sweetCasualImg from "../assets/images/mahi_sweet_casual_1788950345415.jpg";
import cyberNeonImg from "../assets/images/mahi_cyber_neon_1788950364995.jpg";
import elegantSareeImg from "../assets/images/mahi_elegant_saree_1788950381237.jpg";
import animeCozyImg from "../assets/images/mahi_anime_cozy_1788950397772.jpg";

export const AVATAR_OPTIONS: Record<Exclude<AvatarId, "custom">, AvatarOption> = {
  "sweet-casual": {
    id: "sweet-casual",
    name: "Sweet Casual Mahi",
    tagline: "Natural, affectionate & warm smile",
    imageUrl: sweetCasualImg,
    style: "Photorealistic Casual",
  },
  "cyber-neon": {
    id: "cyber-neon",
    name: "Cyber Neon Mahi",
    tagline: "High-tech cyberpunk aesthetic with neon highlights",
    imageUrl: cyberNeonImg,
    style: "Cyberpunk Digital Art",
  },
  "elegant-saree": {
    id: "elegant-saree",
    name: "Royal Saree Mahi",
    tagline: "Traditional elegance in designer pastel saree & jhumkas",
    imageUrl: elegantSareeImg,
    style: "Indian Traditional Elegance",
  },
  "anime-cozy": {
    id: "anime-cozy",
    name: "Anime Dream Mahi",
    tagline: "Cozy anime girlfriend aesthetic with gentle blush",
    imageUrl: animeCozyImg,
    style: "Makoto Shinkai Anime Aesthetic",
  },
};

export const DEFAULT_AVATAR_ID: AvatarId = "sweet-casual";
