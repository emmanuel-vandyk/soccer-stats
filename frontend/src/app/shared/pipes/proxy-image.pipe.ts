import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'proxyImage',
  standalone: true
})
export class ProxyImagePipe implements PipeTransform {
  private readonly API_URL = 'http://localhost:3000/api';

  transform(imageUrl: string | null | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return '/images/avatar-fifa-player.png';
    }

    if (imageUrl.includes('sofifa.net') || imageUrl.includes('sofifa.com')) {
      return `${this.API_URL}/proxy/image?url=${encodeURIComponent(imageUrl)}`;
    }

    return imageUrl;
  }
}
