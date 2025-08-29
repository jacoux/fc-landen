export class SliderTool {
  private wrapper: HTMLElement | null = null;
  private data: any;
  private config: any;

  static get toolbox() {
    return {
      title: 'Slider',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 71-27 27 28zm0 52l-43-30-71 27-81-72-51 34v4c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  constructor({ data, config }: { data: any, config?: any }) {
    this.config = config;
    this.data = {
      images: data.images || [],
      autoplay: data.autoplay || false,
      interval: data.interval || 3000,
      showDots: data.showDots !== false,
      showArrows: data.showArrows !== false,
      caption: data.caption || ''
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('slider-tool-wrapper');

    this.wrapper.innerHTML = `
      <div class="slider-tool-container border border-gray-300 rounded p-4">
        <h3 class="text-lg font-semibold mb-3">Slider configuratie</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Afbeeldingen:</label>
          <div class="slider-images-list space-y-2">
            ${this.renderImages()}
          </div>
          <button type="button" class="add-image-btn mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm">
            + Afbeelding toevoegen
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="autoplay-checkbox" ${this.data.autoplay ? 'checked' : ''}>
              <span class="text-sm">Automatisch afspelen</span>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Interval (ms):</label>
            <input type="text" class="interval-input w-full p-2 border rounded text-sm"
                   value="${this.data.interval}" placeholder="3000">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" class="show-dots-checkbox" ${this.data.showDots ? 'checked' : ''}>
            <span class="text-sm">Toon stippen</span>
          </label>

          <label class="flex items-center space-x-2">
            <input type="checkbox" class="show-arrows-checkbox" ${this.data.showArrows ? 'checked' : ''}>
            <span class="text-sm">Toon pijlen</span>
          </label>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Bijschrift:</label>
          <input type="text" class="caption-input w-full p-2 border rounded text-sm"
                 value="${this.data.caption}" placeholder="Optioneel bijschrift">
        </div>

        <div class="slider-preview bg-gray-100 p-4 rounded">
          <div class="text-sm text-gray-600 mb-2">Preview:</div>
          ${this.renderPreview()}
        </div>
      </div>
    `;

    this.attachEventListeners();
    return this.wrapper;
  }

  renderImages() {
    return this.data.images.map((img: any, index: number) => `
      <div class="slider-image-item flex items-center space-x-2 p-2 border rounded">
        <img src="${img.url}" alt="${img.caption || 'Slider image'}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1">
          <input type="text" value="${img.caption || ''}" placeholder="Bijschrift"
                 class="w-full p-1 border rounded text-sm image-caption" data-index="${index}">
        </div>
        <button type="button" class="remove-image-btn px-2 py-1 bg-red-500 text-white rounded text-sm" data-index="${index}">
          ×
        </button>
      </div>
    `).join('');
  }

  renderPreview() {
    if (this.data.images.length === 0) {
      return '<div class="text-gray-500 text-center py-4">Geen afbeeldingen toegevoegd</div>';
    }

    return `
      <div class="slider-preview-container">
        <div class="text-center">
          <img src="${this.data.images[0]?.url}" alt="Preview" class="max-w-full h-32 object-cover rounded mb-2">
          <div class="text-sm text-gray-600">${this.data.images.length} afbeelding(en)</div>
          ${this.data.caption ? `<div class="text-sm mt-1">${this.data.caption}</div>` : ''}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    if (!this.wrapper) return;

    // Add image button
    this.wrapper.querySelector('.add-image-btn')?.addEventListener('click', () => {
      this.openImagePicker();
    });

    // Remove image buttons
    this.wrapper.querySelectorAll('.remove-image-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset["index"] || '0');
        this.removeImage(index);
      });
    });

    this.wrapper.querySelectorAll('.image-caption').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset["index"] || '0');
        const value = (e.target as HTMLInputElement).value;
        this.updateImageCaption(index, value);
      });
    });

    // Settings inputs
    this.wrapper.querySelector('.autoplay-checkbox')?.addEventListener('change', (e) => {
      this.data.autoplay = (e.target as HTMLInputElement).checked;
    });

    this.wrapper.querySelector('.interval-input')?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value >= 1000) {
        this.data.interval = value;
      }
    });

    this.wrapper.querySelector('.show-dots-checkbox')?.addEventListener('change', (e) => {
      this.data.showDots = (e.target as HTMLInputElement).checked;
    });

    this.wrapper.querySelector('.show-arrows-checkbox')?.addEventListener('change', (e) => {
      this.data.showArrows = (e.target as HTMLInputElement).checked;
    });

    this.wrapper.querySelector('.caption-input')?.addEventListener('input', (e) => {
      this.data.caption = (e.target as HTMLInputElement).value;
    });
  }

  openImagePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        try {
          console.log('Uploading image:', files[i].name);
          console.log('Config available:', !!this.config);
          console.log('Uploader available:', !!this.config?.uploader?.uploadByFile);

          // Use the same upload function as the regular image tool
          if (this.config?.uploader?.uploadByFile) {
            const result = await this.config.uploader.uploadByFile(files[i]);
            console.log('Upload result:', result);

            if (result.success) {
              this.data.images.push({
                url: result.file.url,
                caption: ''
              });
              console.log('Image added to slider:', result.file.url);
            } else {
              console.error('Upload failed:', result);
            }
          } else {
            console.error('No uploader configured for slider tool');
            console.log('Config:', this.config);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));

        }
      }

      this.updateDisplay();
    };

    input.click();
  }

  removeImage(index: number) {
    this.data.images.splice(index, 1);
    this.updateDisplay();
  }

  updateImageCaption(index: number, caption: string) {
    if (this.data.images[index]) {
      this.data.images[index].caption = caption;
    }
  }

  updateDisplay() {
    if (!this.wrapper) return;

    const imagesList = this.wrapper.querySelector('.slider-images-list');
    const preview = this.wrapper.querySelector('.slider-preview');

    if (imagesList) {
      imagesList.innerHTML = this.renderImages();
      // Only reattach image-specific event listeners
      this.attachImageEventListeners();
    }

    if (preview) {
      preview.innerHTML = this.renderPreview();
    }
  }

  attachImageEventListeners() {
    if (!this.wrapper) return;

    // Remove image buttons
    this.wrapper.querySelectorAll('.remove-image-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset["index"] || '0');
        this.removeImage(index);
      });
    });

    // Image caption inputs
    this.wrapper.querySelectorAll('.image-caption').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset["index"] || '0');
        const value = (e.target as HTMLInputElement).value;
        this.updateImageCaption(index, value);
      });
    });
  }

  save() {
    return this.data;
  }

  static get pasteConfig() {
    return {
      tags: ['IMG'],
      files: {
        mimeTypes: ['image/*']
      }
    };
  }
}
