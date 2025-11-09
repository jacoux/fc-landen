
export interface CardData {
  title: string;
  description: string;
  link: string;
  linkTitle: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesSection {
  title: string;
  description: string;
  featureItems: FeatureItem[];
}

export interface NewsletterSection {
  title: string;
  description: string;
  cta: string;
  privacy: string;
}


export interface HomePageData {
  sections: {
    header: {
      subtitle: string;
      title: string;
      description: string;
    };
    cta: {
      title: string;
      description: string;
      card: CardData[];
    };
    features: FeaturesSection;
    blogHeader: {
      title: string;
      description: string;
      articlePaths: string[];
    };
    events: {
      title: string;
      description: string;
      articlePaths: string[];
    };
    newsletter: NewsletterSection;
  };
}
