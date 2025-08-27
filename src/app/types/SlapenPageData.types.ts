export interface SlapenTag {
  title: string,
  description: string,
  articlePaths: string[]
}

export interface SlapenPageData {
  sections: {
    header: {
      subtitle: string;
      title: string;
      description: string;
    };
    tags: SlapenTag[];
  }
}
