import {Component, inject, input, OnInit, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HomePageData} from '../../types/HomePageData.types';
import {Router} from '@angular/router';
@Component({
  selector: 'app-sidebar-editor',
  templateUrl: './sidebar-editor.component.html',
  imports: [
    FormsModule
  ],
  host: {
    '[style.display]': '"block"'
  }
})

export class SidebarEditorComponent implements OnInit {
  block = input.required<HomePageData>();
  newData = signal<HomePageData>({
    sections: {
      header: {
        subtitle: '',
        title: '',
        description: ''
      },
      cta: {
        title: '',
        description: '',
        card: [
          {
            title: '',
            description: '',
            link: '',
            linkTitle: '',
          },
          {
            title: '',
            description: '',
            link: '',
            linkTitle: '',
          },
          {
            title: '',
            description: '',
            link: '',
            linkTitle: '',
          },
        ]
      },
      blogHeader: {
        title: '',
        description: '',
        articlePaths: []
      },
      events: {
        title: '',
        description: '',
        articlePaths: []
      },
      newsletter: {
        title: '',
        description: '',
        cta: '',
        privacy: '',
      },
    }
  });
  updateBlock = output<HomePageData>();
  blockSave = output<HomePageData>();

  readonly #router = inject(Router);

  ngOnInit(): void {
    this.newData.set({
      sections: {
        header: {
          subtitle: this.block()?.sections.header.subtitle ?? '',
          title: this.block()?.sections.header.title ?? '',
          description: this.block()?.sections.header.description ?? ''
        },
        cta: {
          title: this.block()?.sections.cta.title ?? '',
          description: this.block()?.sections.cta.description ?? '',
          card: this.block()?.sections.cta.card?.map(card => ({
            title: card.title ?? '',
            description: card.description ?? '',
            link: card.link ?? '',
            linkTitle: card.linkTitle ?? ''
          })) ?? [
            { title: '', description: '', link: '', linkTitle: '' },
            { title: '', description: '', link: '', linkTitle: '' },
            { title: '', description: '', link: '', linkTitle: '' }
          ]
        },
        blogHeader: {
          title: this.block()?.sections.blogHeader.title ?? '',
          description: this.block()?.sections.blogHeader.description ?? '',
          articlePaths: this.block()?.sections.blogHeader.articlePaths ?? []
        },
        events: {
          title: this.block()?.sections.events.title ?? '',
          description: this.block()?.sections.events.description ?? '',
          articlePaths: this.block()?.sections.events.articlePaths ?? []
        },
        newsletter: {
          title: this.block()?.sections.newsletter.title ?? '',
          description: this.block()?.sections.newsletter.description ?? '',
          cta: this.block()?.sections.newsletter.cta ?? '',
          privacy: this.block()?.sections.newsletter.privacy ?? ''
        }
      }
    });
}

close() {
    this.#router.navigate([], {
      queryParams: { editor: null }
    });
}
  updateBlockFn(data: string, key: string) {
    const cardMatch = key.match(/^ctaCard(\d+)(Title|Description|Link|LinkTitle)$/i);
    if (cardMatch) {
      const idx = Number(cardMatch[1]);
      const field = cardMatch[2].toLowerCase();
      if (this.newData().sections.cta.card[idx]) {
        (this.newData().sections.cta.card[idx] as any)[field] = data;
      }
      return;
    }

    switch (key) {
      case 'subtitle':
        this.newData().sections.header.subtitle = data;
        break;
      case 'title':
        this.newData().sections.header.title = data;
        break;
      case 'description':
        this.newData().sections.header.description = data;
        break;
      case 'ctaTitle':
        this.newData().sections.cta.title = data;
        break;
      case 'ctaDescription':
        this.newData().sections.cta.description = data;
        break;
      case 'blogHeaderTitle':
        this.newData().sections.blogHeader.title = data;
        break;
      case 'blogHeaderDescription':
        this.newData().sections.blogHeader.description = data;
        break;
        case 'eventHeaderTitle':
        this.newData().sections.events.title = data;
        break;
      case 'eventHeaderDescription':
        this.newData().sections.events.description = data;
        break;
      case 'newsletterTitle':
        this.newData().sections.newsletter.title = data;
        break;
      case 'newsletterDescription':
        this.newData().sections.newsletter.description = data;
        break;
      case 'newsletterCta':
        this.newData().sections.newsletter.cta = data;
        break;
      case 'newsletterPrivacy':
        this.newData().sections.newsletter.privacy = data;
        break;
    }
    this.updateBlock.emit(this.newData());
  }
}
