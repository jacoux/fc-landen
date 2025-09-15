import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CardComponent} from '../../ui/card/card.component';
import {SidebarEditorComponent} from '../../components/sidebar-editor/sidebar-editor.component';
import {EditorDirective} from '../../directives/editor.directive';
import {HttpClient} from '@angular/common/http';
import {SaveToGithubService} from '../../services/saveToGithub';
import {HomePageData} from '../../types/HomePageData.types';
import { ArticleLatestComponent } from '../../components/article-latest/article-latest.component';
import {FeaturesComponent} from '../../components/features/features.component';
import {LogosComponent} from '../../components/logos/logos.component';
import {SponsorsService, SponsorsData} from '../../services/sponsors.service';
import {DeployNotificationService} from '../../services/deploy-notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SidebarEditorComponent, EditorDirective, ArticleLatestComponent, FeaturesComponent, LogosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  title = 'babydrukte-front';
  dataFile = 'assets/pages/home.json';
  jsonSha: string | null = null;
  readonly #http = inject(HttpClient);
  readonly #githubSave = inject(SaveToGithubService);
  readonly #sponsorsService = inject(SponsorsService);
  readonly #deployNotification = inject(DeployNotificationService);

  // Sponsors data
  sponsorsData = signal<SponsorsData>({ title: 'Met dank aan onze sponsors', logos: [] });
  protected homePageData = signal<HomePageData>({
    sections: {
      header: {
        subtitle: '',
        title: '',
        description: '',
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
  ngOnInit() {
    this.loadPageData();
    this.loadSponsorsData();
  }

  loadSponsorsData() {
    this.#sponsorsService.getSponsors().subscribe({
      next: (data) => {
        this.sponsorsData.set(data);
      },
      error: (err) => {
        console.error('Error loading sponsors data:', err);
      }
    });
  }

  saveToGithub() {
    const content = JSON.stringify(this.homePageData(), null, 2); // pretty json
    this.#githubSave.saveFile(this.dataFile, content, this.jsonSha).subscribe({
      next: () => {
        console.log('✅ File saved');
        this.#deployNotification.startDeployCountdown();
      },
      error: (err) => console.error('❌ Save failed', err),
    });
  }

  onBlockUpdate(block: HomePageData) {
    this.homePageData.set(block);
 }

  onBlockSave(block: HomePageData) {
    this.homePageData.set(block);
    this.saveToGithub();
  }

  loadPageData() {
    this.#http.get<HomePageData>('assets/pages/home.json').subscribe((data) => {
      this.homePageData.set(data);
    });
 }
 }
