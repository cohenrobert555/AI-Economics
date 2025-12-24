
export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  skills: Skill[];
  achievements: string[];
  detailedSections: {
    title: string;
    content: string;
  }[];
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface AppState {
  config: SiteConfig;
  profile: Profile;
}
